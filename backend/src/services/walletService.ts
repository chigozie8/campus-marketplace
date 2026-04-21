import { supabaseAdmin } from '../config/supabaseClient.js'
import logger from '../utils/logger.js'

const DEFAULT_PLATFORM_FEE = 100 // fallback if site_settings unreachable

/**
 * Always pull the live platform fee from site_settings so the wallet stays in
 * lockstep with what was charged at checkout. Cached briefly to avoid a DB
 * round-trip on every wallet operation.
 */
let _feeCache: { value: number; expires: number } | null = null
async function getPlatformFee(): Promise<number> {
  const now = Date.now()
  if (_feeCache && _feeCache.expires > now) return _feeCache.value
  try {
    const { data } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'platform_fee_amount')
      .maybeSingle()
    const fee = Number(data?.value)
    const value = Number.isFinite(fee) && fee >= 0 ? fee : DEFAULT_PLATFORM_FEE
    _feeCache = { value, expires: now + 60_000 } // 1-minute cache
    return value
  } catch {
    return DEFAULT_PLATFORM_FEE
  }
}

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
  const platformFee = await getPlatformFee()
  const sellerAmount = totalPaid - platformFee
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
      description: `Order payment received — pending delivery confirmation (₦${platformFee} platform fee deducted)`,
    })

    logger.info(`[wallet] Credited ₦${sellerAmount} pending to seller ${sellerId} for order ${orderId}`)
  } catch (err) {
    logger.error(`[wallet] Failed to credit seller ${sellerId}: ${err}`)
  }
}

// Called when order is marked "completed" — move pending → available.
// Self-healing: if no pending wallet entry exists (e.g. the original
// payment webhook missed creating one), we look up the order's actual
// amount and credit the seller's available balance directly. This ensures
// the seller ALWAYS gets paid the moment the buyer confirms delivery.
export async function releaseSellerEarnings(sellerId: string, orderId: string) {
  try {
    // Idempotency: if we've already released for this order, do nothing.
    const wallet = await ensureWallet(sellerId)
    const { data: alreadyReleased } = await supabaseAdmin
      .from('wallet_transactions')
      .select('id')
      .eq('wallet_id', wallet.id)
      .eq('order_id', orderId)
      .eq('type', 'release')
      .maybeSingle()

    if (alreadyReleased) {
      logger.info(`[wallet] Order ${orderId} earnings already released — skipping`)
      return
    }

    // Try the standard path first: a pending entry exists from payment.
    const { data: txn } = await supabaseAdmin
      .from('wallet_transactions')
      .select('*')
      .eq('wallet_id', wallet.id)
      .eq('order_id', orderId)
      .eq('type', 'pending')
      .eq('status', 'pending')
      .maybeSingle()

    let amountToRelease = txn?.amount ?? 0

    // Self-heal: no pending entry — derive the amount from the order itself.
    // This catches orders paid before the wallet system existed, missed
    // webhooks, manual admin completions, etc.
    if (!txn) {
      const { data: order } = await supabaseAdmin
        .from('orders')
        .select('total_amount, status')
        .eq('id', orderId)
        .maybeSingle()

      if (!order) {
        logger.warn(`[wallet] Cannot release — order ${orderId} not found`)
        return
      }
      const platformFee = await getPlatformFee()
      amountToRelease = Math.max(0, Number(order.total_amount ?? 0) - platformFee)
      if (amountToRelease <= 0) {
        logger.warn(`[wallet] Order ${orderId} amount too small to release after platform fee`)
        return
      }
      logger.info(`[wallet] Self-heal release for order ${orderId} — no pending entry, crediting ₦${amountToRelease} directly to available (fee ₦${platformFee})`)
    }

    // Credit available balance (and decrement pending if a pending entry existed)
    await supabaseAdmin
      .from('wallets')
      .update({
        available: wallet.available + amountToRelease,
        pending: txn ? Math.max(0, wallet.pending - amountToRelease) : wallet.pending,
        updated_at: new Date().toISOString(),
      })
      .eq('id', wallet.id)

    if (txn) {
      await supabaseAdmin
        .from('wallet_transactions')
        .update({ status: 'completed' })
        .eq('id', txn.id)
    }

    await supabaseAdmin.from('wallet_transactions').insert({
      wallet_id: wallet.id,
      order_id: orderId,
      type: 'release',
      amount: amountToRelease,
      status: 'completed',
      description: 'Earnings released — order completed',
    })

    logger.info(`[wallet] Released ₦${amountToRelease} to seller ${sellerId} for order ${orderId}`)
  } catch (err) {
    logger.error(`[wallet] Failed to release earnings for order ${orderId}: ${err}`)
  }
}

// Called on refund — reverse pending credit on the seller's wallet AND
// credit the buyer's wallet so they have an immediate, in-platform refund.
//
// Escrow model: the original Paystack settlement sits with the platform.
// We hold the seller's earnings in `pending` until delivery is confirmed.
// When a refund is approved we:
//   1) Drop the seller's pending balance back down (reverse the credit), and
//   2) Add the buyer-paid amount to the buyer's `available` wallet balance.
// The buyer can then withdraw to their bank or reuse the funds.
export async function reversePendingCredit(
  sellerId: string,
  buyerId: string,
  orderId: string,
  buyerRefundAmount: number,
) {
  try {
    // 1) Reverse the seller-side pending credit (if it exists)
    const sellerWallet = await ensureWallet(sellerId)

    const { data: txn } = await supabaseAdmin
      .from('wallet_transactions')
      .select('*')
      .eq('wallet_id', sellerWallet.id)
      .eq('order_id', orderId)
      .eq('type', 'pending')
      .single()

    if (txn) {
      await supabaseAdmin
        .from('wallets')
        .update({
          pending: Math.max(0, sellerWallet.pending - txn.amount),
          updated_at: new Date().toISOString(),
        })
        .eq('id', sellerWallet.id)

      await supabaseAdmin
        .from('wallet_transactions')
        .update({ status: 'reversed' })
        .eq('id', txn.id)

      await supabaseAdmin.from('wallet_transactions').insert({
        wallet_id: sellerWallet.id,
        order_id: orderId,
        type: 'refund',
        amount: txn.amount,
        status: 'completed',
        description: 'Pending earnings reversed — order refunded to buyer',
      })
    }

    // 2) Credit the buyer's wallet with the full amount they paid
    if (buyerRefundAmount > 0) {
      const buyerWallet = await ensureWallet(buyerId)

      await supabaseAdmin
        .from('wallets')
        .update({
          available: buyerWallet.available + buyerRefundAmount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', buyerWallet.id)

      await supabaseAdmin.from('wallet_transactions').insert({
        wallet_id: buyerWallet.id,
        order_id: orderId,
        type: 'refund',
        amount: buyerRefundAmount,
        status: 'completed',
        description: 'Refund credited — order cancelled',
      })

      logger.info(`[wallet] Refunded ₦${buyerRefundAmount} to buyer ${buyerId} for order ${orderId}`)
    }
  } catch (err) {
    logger.error(`[wallet] Failed to process refund for order ${orderId}: ${err}`)
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
