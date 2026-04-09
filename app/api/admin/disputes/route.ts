import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { checkAndNotifyBuyerMilestones, checkAndNotifySellerMilestones } from '@/lib/trust-milestones'
import { releaseSellerEarnings, reversePendingCredit } from '@/lib/wallet-service'

function svc() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

async function requireAdmin() {
  const supabase = await createClient()
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('admin_roles').select('role').eq('user_id', user.id).single()
  return data ? user : null
}

export async function GET(req: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const url = new URL(req.url)
  const status = url.searchParams.get('status') || 'open'

  let query = svc()
    .from('order_disputes')
    .select(`
      *,
      orders(id, total_amount, status, delivery_address),
      buyer:profiles!order_disputes_buyer_id_fkey(id, full_name, email),
      seller:profiles!order_disputes_seller_id_fkey(id, full_name, email)
    `)
    .order('created_at', { ascending: false })

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ disputes: data ?? [] })
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, resolution, admin_note } = await req.json()
  if (!id || !resolution) {
    return NextResponse.json({ error: 'id and resolution are required' }, { status: 400 })
  }

  const validResolutions = ['resolved_buyer', 'resolved_seller', 'cancelled']
  if (!validResolutions.includes(resolution)) {
    return NextResponse.json({ error: 'Invalid resolution' }, { status: 400 })
  }

  const { data: dispute, error: fetchErr } = await svc()
    .from('order_disputes')
    .select('*, orders(id, seller_id, buyer_id, status)')
    .eq('id', id)
    .single()

  if (fetchErr || !dispute) return NextResponse.json({ error: 'Dispute not found' }, { status: 404 })

  const { error: updateErr } = await svc()
    .from('order_disputes')
    .update({
      status: resolution,
      admin_note: admin_note || null,
      resolved_at: new Date().toISOString(),
      resolved_by: admin.id,
    })
    .eq('id', id)

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

  const order = dispute.orders as { id: string; seller_id: string; buyer_id: string; status: string }

  if (resolution === 'resolved_seller') {
    await svc()
      .from('orders')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', order.id)
      .catch(() => {})

    await releaseSellerEarnings(order.seller_id, order.id).catch(() => {})

    await svc().from('notifications').insert([
      { user_id: order.seller_id, title: 'Dispute Resolved — In Your Favour', body: `Admin reviewed the dispute for order #${order.id.split('-')[0]} and released payment to you.`, type: 'system' },
      { user_id: order.buyer_id, title: 'Dispute Resolved', body: `Admin reviewed your dispute for order #${order.id.split('-')[0]}. Decision: funds released to seller.`, type: 'system' },
    ]).catch(() => {})
  }

  if (resolution === 'resolved_buyer') {
    await svc()
      .from('orders')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', order.id)
      .catch(() => {})

    await reversePendingCredit(order.seller_id, order.id).catch(() => {})

    await svc().from('notifications').insert([
      { user_id: order.buyer_id, title: 'Dispute Resolved — In Your Favour', body: `Admin reviewed your dispute for order #${order.id.split('-')[0]}. Refund has been processed.`, type: 'system' },
      { user_id: order.seller_id, title: 'Dispute Resolved', body: `Admin reviewed the dispute for order #${order.id.split('-')[0]}. Decision: refund to buyer.`, type: 'system' },
    ]).catch(() => {})
  }

  // Fire-and-forget milestone checks after dispute resolution
  checkAndNotifyBuyerMilestones(order.buyer_id).catch(() => {})
  checkAndNotifySellerMilestones(order.seller_id).catch(() => {})

  return NextResponse.json({ ok: true, resolution })
}
