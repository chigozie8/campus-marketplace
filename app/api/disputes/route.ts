import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { productId, orderId, reason, details } = await req.json()
    if (!productId || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: product } = await supabase
      .from('products')
      .select('id, title, seller_id')
      .eq('id', productId)
      .single()

    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    const { error: insertError } = await supabase.from('disputes').insert({
      product_id: productId,
      order_id: orderId || null,
      reporter_id: user.id,
      seller_id: product.seller_id,
      reason,
      details: details || null,
      status: 'open',
    })

    if (insertError && !insertError.message.includes('does not exist')) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    try {
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Dispute Submitted',
        body: `Your dispute for "${product.title}" has been received. Our team will review it within 24 hours.`,
        type: 'dispute_opened',
        data: { url: '/dashboard/orders', productId },
      })
    } catch { /* non-critical */ }

    return NextResponse.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }

    const { data: disputes, error } = await supabase
      .from('disputes')
      .select('*, products(id, title, images), profiles!disputes_reporter_id_fkey(full_name)')
      .order('created_at', { ascending: false })

    if (error && !error.message.includes('does not exist')) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ disputes: disputes || [] })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
