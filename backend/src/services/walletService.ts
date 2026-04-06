import { supabaseAdmin } from '../config/supabaseClient.js'
import logger from '../utils/logger.js'

const PLATFORM_FEE = 100 // ₦100 in naira

// Ensure a wallet exists for a user; return it
export async function ensureWallet(userId: string) {
  const { data: existing } = await supabaseAdmin
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (existing) return existing

  const { data, error } = await supabaseAdmin
    .from('wallets')
    .insert({ user_id: userId, available: 0, pending: 0 })
    .select()
    .single()

  if (error) throw new Error(`Could not create wallet: ${error.message}`)
  return data
}

export async function getWallet(userId: string) {
  return ensureWallet(userId)
}

export async function getWalletTransactions(userId: string, page = 1, limit = 20) {
  const wallet = await ensureWallet(userId)
  const from = (page - 1) * limit

  const { data, error, count } = await supabaseAdmin
    .from('wallet_transactions')
    .select('*', { count: 'exact' })
    .eq('wallet_id', wallet.id)
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1)

  if (error) throw new Error(error.message)
  return { data: data ?? [], total: count ?? 0, page, limit }
}

// Called when Paystack confirms payment — adds pending credit to seller wallet
export async function creditSellerPending(
  sellerId: string,
  orderId: string,
  totalPaid: number,
) {
  const sellerAmount = totalPaid - PLATFORM_FEE
  if (sellerAmount <= 0) return

  try {
    const wallet = await ensureWallet(sellerId)

    await supabaseAdmin
      .from('wallets')
      .update({ pending: wallet.pending + sellerAmount, updated_at: new Date().toISOString() })
      .eq('id', wallet.id)

    await supabaseAdmin.from('wallet_transactions').insert({
      wallet_id: wallet.id,
      order_id: orderId,
      type: 'pending',
      amount: sellerAmount,
      status: 'pending',
      description: `Order payment received — pending delivery confirmation (₦${PLATFORM_FEE} platform fee deducted)`,
    })

    logger.info(`[wallet] Credited ₦${sellerAmount} pending to seller ${sellerId} for order ${orderId}`)
  } catch (err) {
    logger.error(`[wallet] Failed to credit seller ${sellerId}: ${err}`)
  }
}

// Called when order is marked "completed" — move pending → available
export async function releaseSellerEarnings(sellerId: string, orderId: string) {
  try {
    const wallet = await ensureWallet(sellerId)

    const { data: txn } = await supabaseAdmin
      .from('wallet_transactions')
      .select('*')
      .eq('wallet_id', wallet.id)
      .eq('order_id', orderId)
      .eq('type', 'pending')
      .eq('status', 'pending')
      .single()

    if (!txn) return

    await supabaseAdmin
      .from('wallets')
      .update({
        available: wallet.available + txn.amount,
        pending: Math.max(0, wallet.pending - txn.amount),
        updated_at: new Date().toISOString(),
      })
      .eq('id', wallet.id)

    await supabaseAdmin
      .from('wallet_transactions')
      .update({ status: 'completed' })
      .eq('id', txn.id)

    await supabaseAdmin.from('wallet_transactions').insert({
      wallet_id: wallet.id,
      order_id: orderId,
      type: 'release',
      amount: txn.amount,
      status: 'completed',
      description: 'Earnings released — order completed',
    })

    logger.info(`[wallet] Released ₦${txn.amount} to seller ${sellerId} for order ${orderId}`)
  } catch (err) {
    logger.error(`[wallet] Failed to release earnings for order ${orderId}: ${err}`)
  }
}

// Called on refund — reverse pending credit
export async function reversePendingCredit(sellerId: string, orderId: string) {
  try {
    const wallet = await ensureWallet(sellerId)

    const { data: txn } = await supabaseAdmin
      .from('wallet_transactions')
      .select('*')
      .eq('wallet_id', wallet.id)
      .eq('order_id', orderId)
      .eq('type', 'pending')
      .single()

    if (!txn) return

    await supabaseAdmin
      .from('wallets')
      .update({
        pending: Math.max(0, wallet.pending - txn.amount),
        updated_at: new Date().toISOString(),
      })
      .eq('id', wallet.id)

    await supabaseAdmin
      .from('wallet_transactions')
      .update({ status: 'reversed' })
      .eq('id', txn.id)

    await supabaseAdmin.from('wallet_transactions').insert({
      wallet_id: wallet.id,
      order_id: orderId,
      type: 'refund',
      amount: txn.amount,
      status: 'completed',
      description: 'Refund issued to buyer — order disputed',
    })
  } catch (err) {
    logger.error(`[wallet] Failed to reverse credit for order ${orderId}: ${err}`)
  }
}

// Seller requests withdrawal — calls Paystack Transfer
export async function requestWithdrawal(
  userId: string,
  amount: number,
  bankCode: string,
  accountNumber: string,
  accountName: string,
) {
  const wallet = await ensureWallet(userId)

  if (wallet.available < amount) {
    throw Object.assign(new Error('Insufficient available balance'), { status: 400 })
  }
  if (amount < 1000) {
    throw Object.assign(new Error('Minimum withdrawal is ₦1,000'), { status: 400 })
  }

  const paystackKey = process.env.PAYSTACK_SECRET_KEY
  if (!paystackKey) throw new Error('Paystack key not configured')

  // 1. Create a transfer recipient on Paystack
  const recipientRes = await fetch('https://api.paystack.co/transferrecipient', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${paystackKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'nuban',
      name: accountName,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: 'NGN',
    }),
  })
  const recipientData = await recipientRes.json()
  if (!recipientData.status) {
    throw new Error(recipientData.message || 'Could not create transfer recipient')
  }
  const recipientCode = recipientData.data.recipient_code

  // 2. Initiate the transfer
  const transferRes = await fetch('https://api.paystack.co/transfer', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${paystackKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: 'balance',
      amount: amount * 100, // kobo
      recipient: recipientCode,
      reason: 'VendoorX seller withdrawal',
    }),
  })
  const transferData = await transferRes.json()
  if (!transferData.status) {
    throw new Error(transferData.message || 'Transfer failed')
  }

  const ref = transferData.data.transfer_code

  // 3. Deduct from wallet
  await supabaseAdmin
    .from('wallets')
    .update({
      available: wallet.available - amount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', wallet.id)

  await supabaseAdmin.from('wallet_transactions').insert({
    wallet_id: wallet.id,
    type: 'withdrawal',
    amount,
    status: 'completed',
    description: `Withdrawal to ${accountName} (${bankCode} - ${accountNumber})`,
    paystack_ref: ref,
  })

  return { transfer_code: ref, amount }
}
