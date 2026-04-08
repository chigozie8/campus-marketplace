import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

function adminClient() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: orderId } = await params

  const { data, error } = await adminClient()
    .from('order_disputes')
    .select('*')
    .eq('order_id', orderId)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ dispute: data ?? null })
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: orderId } = await params
  const { reason, evidence } = await req.json()

  if (!reason?.trim()) {
    return NextResponse.json({ error: 'Reason is required' }, { status: 400 })
  }

  const { data: order, error: orderErr } = await adminClient()
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

  const { data: existing } = await adminClient()
    .from('order_disputes')
    .select('id, status')
    .eq('order_id', orderId)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'A dispute already exists for this order', dispute: existing }, { status: 409 })
  }

  const { data: dispute, error: insertErr } = await adminClient()
    .from('order_disputes')
    .insert({
      order_id: orderId,
      buyer_id: user.id,
      seller_id: order.seller_id,
      reason: reason.trim(),
      evidence: evidence?.trim() || null,
      status: 'open',
      amount: order.total_amount,
    })
    .select()
    .single()

  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

  await adminClient()
    .from('orders')
    .update({ status: 'disputed', updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .catch(() => {})

  await adminClient().from('notifications').insert([
    {
      user_id: order.seller_id,
      title: 'Dispute Opened',
      message: `A buyer has opened a dispute on order #${orderId.split('-')[0]}. Admin will review and contact you.`,
      type: 'system',
    },
    {
      user_id: user.id,
      title: 'Dispute Received',
      message: 'Your dispute has been submitted. Our team will review it within 24 hours.',
      type: 'system',
    },
  ]).catch(() => {})

  return NextResponse.json({ dispute }, { status: 201 })
}
