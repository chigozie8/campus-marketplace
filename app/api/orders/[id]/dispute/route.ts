import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: orderId } = await params

  // Authz: only the buyer, seller, or an admin may read this dispute.
  const svc = createServiceClient()
  if (!svc) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

  const { data: order, error: orderErr } = await svc
    .from('orders')
    .select('buyer_id, seller_id')
    .eq('id', orderId)
    .single()

  if (orderErr || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  let allowed = order.buyer_id === user.id || order.seller_id === user.id
  if (!allowed) {
    const { data: adminRow } = await svc
      .from('admin_roles').select('role').eq('user_id', user.id).maybeSingle()
    if (adminRow) allowed = true
  }
  if (!allowed) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await svc
    .from('order_disputes')
    .select('id, order_id, buyer_id, seller_id, reason, evidence, status, admin_note, resolved_at, created_at, amount')
    .eq('order_id', orderId)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ dispute: data ?? null })
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: orderId } = await params

    let body: { reason?: string; evidence?: string } = {}
    try { body = await req.json() } catch { /* empty body */ }
    const { reason, evidence } = body

    if (!reason?.trim()) {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 })
    }

    const svc = createServiceClient()
    if (!svc) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

    const { data: order, error: orderErr } = await svc
      .from('orders')
      .select('id, buyer_id, seller_id, status, total_amount')
      .eq('id', orderId)
      .single()

    if (orderErr || !order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.buyer_id !== user.id) return NextResponse.json({ error: 'Only the buyer can dispute an order' }, { status: 403 })

    const allowedStatuses = ['paid', 'shipped', 'delivered']
    if (!allowedStatuses.includes(order.status)) {
      return NextResponse.json({ error: `Cannot dispute an order with status "${order.status}"` }, { status: 400 })
    }

    const { data: existing } = await svc
      .from('order_disputes')
      .select('id, status')
      .eq('order_id', orderId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'A dispute already exists for this order', dispute: existing }, { status: 409 })
    }

    const { data: dispute, error: insertErr } = await svc
      .from('order_disputes')
      .insert({
        order_id:  orderId,
        buyer_id:  user.id,
        seller_id: order.seller_id,
        reason:    reason.trim(),
        evidence:  evidence?.trim() || null,
        status:    'open',
        amount:    order.total_amount,
      })
      .select()
      .single()

    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

    // Side-effects — never let them break the dispute response
    try {
      await svc
        .from('orders')
        .update({ status: 'disputed', updated_at: new Date().toISOString() })
        .eq('id', orderId)
    } catch { /* non-critical */ }

    try {
      await svc.from('notifications').insert([
        {
          user_id: order.seller_id,
          title:   'Dispute Opened',
          message: `A buyer has opened a dispute on order #${orderId.split('-')[0]}. Admin will review and contact you.`,
          type:    'system',
        },
        {
          user_id: user.id,
          title:   'Dispute Received',
          message: 'Your dispute has been submitted. Our team will review it within 24 hours.',
          type:    'system',
        },
      ])
    } catch { /* non-critical */ }

    return NextResponse.json({ dispute }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
