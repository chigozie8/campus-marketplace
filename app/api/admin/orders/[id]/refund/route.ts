import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { sendNotification } from '@/lib/send-notification'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function getAdminUser() {
  const supabase = await createClient()
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: role } = await adminDb.from('admin_roles').select('role').eq('user_id', user.id).single()
  return role ? user : null
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminUser = await getAdminUser()
  if (!adminUser) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id: orderId } = await params
  const { refund_to, amount, reason, proof } = await req.json()

  if (!['buyer', 'seller'].includes(refund_to)) {
    return NextResponse.json({ error: 'refund_to must be "buyer" or "seller"' }, { status: 400 })
  }
  if (!reason?.trim()) {
    return NextResponse.json({ error: 'A reason is required for admin refunds' }, { status: 400 })
  }

  // Fetch the order
  const { data: order, error: orderErr } = await adminDb
    .from('orders')
    .select('id, buyer_id, seller_id, total_amount, status')
    .eq('id', orderId)
    .single()

  if (orderErr || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const refundAmount = amount ?? order.total_amount
  const recipientId = refund_to === 'buyer' ? order.buyer_id : order.seller_id

  // Get or create wallet for recipient
  let { data: wallet } = await adminDb
    .from('wallets')
    .select('*')
    .eq('user_id', recipientId)
    .single()

  if (!wallet) {
    const { data: created } = await adminDb
      .from('wallets')
      .insert({ user_id: recipientId, balance: 0 })
      .select()
      .single()
    wallet = created
  }

  if (!wallet) {
    return NextResponse.json({ error: 'Could not access recipient wallet' }, { status: 500 })
  }

  // Credit the wallet
  const newBalance = (wallet.balance ?? 0) + refundAmount

  await adminDb
    .from('wallets')
    .update({ balance: newBalance })
    .eq('id', wallet.id)

  // Record transaction
  await adminDb
    .from('wallet_transactions')
    .insert({
      wallet_id: wallet.id,
      type: 'refund',
      amount: refundAmount,
      status: 'completed',
      description: `Admin refund for order ${orderId.slice(0, 8)}: ${reason.trim()}`,
      order_id: orderId,
      reference: `ADMIN-REFUND-${orderId.slice(0, 8)}-${Date.now()}`,
    })

  // Update order status
  await adminDb
    .from('orders')
    .update({ status: 'cancelled', admin_note: reason.trim() })
    .eq('id', orderId)

  // Notify recipient
  await sendNotification({
    userId: recipientId,
    type: 'refund_processed',
    title: 'Refund Processed',
    body: `₦${refundAmount.toLocaleString()} has been credited to your wallet. Reason: ${reason.trim()}`,
    data: { orderId, amount: refundAmount },
  })

  // Notify the other party too
  const otherPartyId = refund_to === 'buyer' ? order.seller_id : order.buyer_id
  await sendNotification({
    userId: otherPartyId,
    type: 'refund_processed',
    title: 'Order Refund Decision',
    body: `Admin has processed a refund for order ${orderId.slice(0, 8).toUpperCase()}. Reason: ${reason.trim()}`,
    data: { orderId },
  })

  return NextResponse.json({
    success: true,
    message: `₦${refundAmount.toLocaleString()} refunded to ${refund_to}.`,
    new_balance: newBalance,
  })
}
