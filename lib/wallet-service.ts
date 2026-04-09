import { createClient } from '@supabase/supabase-js'

function svc() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

async function ensureWallet(userId: string) {
  const { data: existing } = await svc()
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (existing) return existing

  const { data, error } = await svc()
    .from('wallets')
    .insert({ user_id: userId, available: 0, pending: 0 })
    .select()
    .single()

  if (error) throw new Error(`Could not create wallet: ${error.message}`)
  return data
}

export async function releaseSellerEarnings(sellerId: string, orderId: string) {
  try {
    const wallet = await ensureWallet(sellerId)

    const { data: txn } = await svc()
      .from('wallet_transactions')
      .select('*')
      .eq('wallet_id', wallet.id)
      .eq('order_id', orderId)
      .eq('type', 'pending')
      .eq('status', 'pending')
      .single()

    if (!txn) return

    await svc()
      .from('wallets')
      .update({
        available: wallet.available + txn.amount,
        pending: Math.max(0, wallet.pending - txn.amount),
        updated_at: new Date().toISOString(),
      })
      .eq('id', wallet.id)

    await svc()
      .from('wallet_transactions')
      .update({ status: 'completed' })
      .eq('id', txn.id)

    await svc().from('wallet_transactions').insert({
      wallet_id: wallet.id,
      order_id: orderId,
      type: 'release',
      amount: txn.amount,
      status: 'completed',
      description: 'Earnings released — order completed',
    })
  } catch {
  }
}

export async function reversePendingCredit(sellerId: string, orderId: string) {
  try {
    const wallet = await ensureWallet(sellerId)

    const { data: txn } = await svc()
      .from('wallet_transactions')
      .select('*')
      .eq('wallet_id', wallet.id)
      .eq('order_id', orderId)
      .eq('type', 'pending')
      .single()

    if (!txn) return

    await svc()
      .from('wallets')
      .update({
        pending: Math.max(0, wallet.pending - txn.amount),
        updated_at: new Date().toISOString(),
      })
      .eq('id', wallet.id)

    await svc()
      .from('wallet_transactions')
      .update({ status: 'reversed' })
      .eq('id', txn.id)

    await svc().from('wallet_transactions').insert({
      wallet_id: wallet.id,
      order_id: orderId,
      type: 'refund',
      amount: txn.amount,
      status: 'completed',
      description: 'Refund issued to buyer — order disputed',
    })
  } catch {
  }
}
