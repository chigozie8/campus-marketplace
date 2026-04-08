import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { checkAndNotifySellerMilestones } from '@/lib/trust-milestones'

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')
    const sellerId = searchParams.get('sellerId')

    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

    let query = supabase
      .from('reviews')
      .select('*, profiles(full_name, avatar_url)')
      .order('created_at', { ascending: false })

    if (productId) query = query.eq('product_id', productId)
    if (sellerId) query = query.eq('seller_id', sellerId)

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const count = data?.length ?? 0
    const avgRating = count > 0
      ? Math.round((data!.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10
      : 0

    return NextResponse.json({ reviews: data ?? [], count, avgRating })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Sign in to leave a review' }, { status: 401 })

    const { productId, sellerId, rating, comment } = await req.json()

    if (!productId || !sellerId) {
      return NextResponse.json({ error: 'productId and sellerId are required' }, { status: 400 })
    }
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }
    if (user.id === sellerId) {
      return NextResponse.json({ error: "You can't review your own listing" }, { status: 400 })
    }

    const admin = adminClient()

    const { data: existing } = await admin
      .from('reviews')
      .select('id')
      .eq('product_id', productId)
      .eq('reviewer_id', user.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'You have already reviewed this listing' }, { status: 409 })
    }

    const { data: review, error } = await admin
      .from('reviews')
      .insert({
        product_id: productId,
        seller_id: sellerId,
        reviewer_id: user.id,
        rating,
        comment: comment?.trim() || null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Fire-and-forget: seller rating changed → re-check seller milestones (profile update trigger)
    checkAndNotifySellerMilestones(sellerId).catch(() => {})

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      await fetch(`${backendUrl}/api/internal/trust-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-internal-key': process.env.INTERNAL_API_KEY || '' },
        body: JSON.stringify({ type: 'rating_submitted', vendorId: sellerId, payload: { rating } }),
        signal: AbortSignal.timeout(3000),
      }).catch(() => {})
    } catch {}

    return NextResponse.json({ review, message: 'Review submitted successfully' }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
