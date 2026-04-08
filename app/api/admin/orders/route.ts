import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getAdminUser() {
  const supabase = await createClient()
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: role } = await adminClient.from('admin_roles').select('role').eq('user_id', user.id).single()
  return role ? user : null
}

async function releaseSellerEarnings(sellerId: string, orderId: string) {
  const PLATFORM_FEE = 100

  const { data: wallet } = await adminClient
    .from('wallets')
    .select('*')
    .eq('user_id', sellerId)
    .single()

  if (!wallet) return

  const { data: txn } = await adminClient
    .from('wallet_transactions')
    .select('*')
    .eq('wallet_id', wallet.id)
    .eq('order_id', orderId)
    .eq('type', 'pending')
    .eq('status', 'pending')
    .single()

  if (!txn) return

  const now = new Date().toISOString()

  await adminClient
    .from('wallets')
    .update({
      available: wallet.available + txn.amount,
      pending: Math.max(0, wallet.pending - txn.amount),
      updated_at: now,
    })
    .eq('id', wallet.id)

  await adminClient
    .from('wallet_transactions')
    .update({ status: 'completed' })
    .eq('id', txn.id)

  await adminClient.from('wallet_transactions').insert({
    wallet_id: wallet.id,
    order_id: orderId,
    type: 'release',
    amount: txn.amount,
    status: 'completed',
    description: `Earnings released by admin — order completed (₦${PLATFORM_FEE} platform fee already deducted)`,
  })
}

export async function PATCH(req: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { order_id, status, payment_status } = await req.json()
  if (!order_id) return NextResponse.json({ error: 'order_id required' }, { status: 400 })

  const now = new Date().toISOString()
  const updates: Record<string, string> = { updated_at: now }
  if (status) {
    updates.status = status
    if (status === 'delivered') updates.delivered_at = now
  }
  if (payment_status) updates.payment_status = payment_status

  const { data: updatedOrder, error } = await adminClient
    .from('orders')
    .update(updates)
    .eq('id', order_id)
    .select('seller_id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (status === 'completed' && updatedOrder?.seller_id) {
    try {
      await releaseSellerEarnings(updatedOrder.seller_id, order_id)
    } catch (err) {
      console.error('[admin/orders] Wallet release failed:', err)
    }
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { order_id } = await req.json()
  if (!order_id) return NextResponse.json({ error: 'order_id required' }, { status: 400 })

  const { error } = await adminClient.from('orders').delete().eq('id', order_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
