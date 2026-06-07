import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/disputes — submit a product/listing report from the report-dialog.
// This is NOT an order dispute; order disputes live in order_disputes and are
// created via POST /api/orders/[id]/dispute.
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { productId, reason, details } = await req.json()
    if (!productId || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Look up product to capture seller_id — non-fatal if the product is gone
    // (e.g. deleted or hidden by RLS), we still record the report for admins.
    const { data: product } = await supabase
      .from('products')
      .select('id, title, seller_id')
      .eq('id', productId)
      .maybeSingle()

    const resolvedSellerId = product?.seller_id ?? null

    const { error: insertError } = await supabase
      .from('product_reports')
      .insert({
        product_id:  productId,
        reporter_id: user.id,
        seller_id:   resolvedSellerId,
        reason,
        details:     details?.trim() || null,
        status:      'pending',
      })

    if (insertError) {
      console.error('[disputes POST] insert error:', insertError.message)
      // If the table doesn't exist yet (migration not yet run), return a
      // user-friendly error instead of a hard 500.
      if (insertError.code === '42P01') {
        return NextResponse.json(
          { error: 'Reporting is temporarily unavailable. Please try again later.' },
          { status: 503 },
        )
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Best-effort confirmation notification to the reporter — never fatal.
    try {
      await supabase.from('notifications').insert({
        user_id: user.id,
        title:   'Report Submitted',
        body:    'Thank you — our team will review this listing within 24 hours.',
        type:    'system',
        data:    { productId },
      })
    } catch { /* non-critical */ }

    return NextResponse.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// GET /api/disputes — admin: list all product reports.
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

    const url = new URL(req.url)
    const status = url.searchParams.get('status') || 'all'

    let query = supabase
      .from('product_reports')
      .select('*, products(id, title, images), profiles!product_reports_reporter_id_fkey(full_name)')
      .order('created_at', { ascending: false })

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: reports, error } = await query

    if (error) {
      if (error.code === '42P01') {
        // Table not yet created — return empty list gracefully
        return NextResponse.json({ disputes: [] })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ disputes: reports || [] })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
