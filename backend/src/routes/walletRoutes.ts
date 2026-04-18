import { Router } from 'express'
import { authenticate } from '../middleware/authMiddleware.js'
import * as walletService from '../services/walletService.js'
import * as paymentService from '../services/paymentService.js'
import { AuthRequest } from '../types/index.js'
import { supabaseAdmin } from '../config/supabaseClient.js'

const router = Router()
router.use(authenticate)

// GET /api/wallets/me — get wallet balance
router.get('/me', async (req, res, next) => {
  try {
    const userId = (req as AuthRequest).user.id
    const wallet = await walletService.getWallet(userId)
    res.json({ success: true, data: wallet })
  } catch (err) { next(err) }
})

// GET /api/wallets/transactions — paginated transaction history
router.get('/transactions', async (req, res, next) => {
  try {
    const userId = (req as AuthRequest).user.id
    const page = parseInt(String(req.query.page)) || 1
    const limit = parseInt(String(req.query.limit)) || 20
    const result = await walletService.getWalletTransactions(userId, page, limit)
    res.json({ success: true, ...result })
  } catch (err) { next(err) }
})

// POST /api/wallets/withdraw — request withdrawal
router.post('/withdraw', async (req, res, next) => {
  try {
    const userId = (req as AuthRequest).user.id
    const { amount, bank_code, account_number, account_name } = req.body

    if (!amount || !bank_code || !account_number || !account_name) {
      res.status(400).json({ success: false, message: 'amount, bank_code, account_number, account_name are required' })
      return
    }

    // Block check: a "blocked" account can sign in and browse, but cannot
    // withdraw funds. Banned users would already have been rejected at the
    // auth layer before reaching this route.
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_blocked')
      .eq('id', userId)
      .single()
    if (profile?.is_blocked) {
      res.status(403).json({
        success: false,
        message: 'Your account is restricted. Withdrawals are disabled. Please contact support.',
      })
      return
    }

    const result = await walletService.requestWithdrawal(
      userId,
      Number(amount),
      bank_code,
      account_number,
      account_name,
    )
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
})

// POST /api/wallets/refund/:orderId — buyer requests refund
router.post('/refund/:orderId', async (req, res, next) => {
  try {
    const buyerId = (req as AuthRequest).user.id
    const { orderId } = req.params
    const { reason } = req.body

    if (!reason?.trim()) {
      res.status(400).json({ success: false, message: 'Please provide a reason for the refund' })
      return
    }

    // Find the order
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (error || !order) {
      res.status(404).json({ success: false, message: 'Order not found' })
      return
    }
    if (order.buyer_id !== buyerId) {
      res.status(403).json({ success: false, message: 'Not your order' })
      return
    }
    if (!['pending', 'paid', 'shipped'].includes(order.status)) {
      res.status(400).json({ success: false, message: 'Order cannot be refunded at this stage' })
      return
    }

    // Check for existing refund request
    const { data: existing } = await supabaseAdmin
      .from('refund_requests')
      .select('id, status')
      .eq('order_id', orderId)
      .single()

    if (existing) {
      res.status(409).json({ success: false, message: `A refund request already exists (${existing.status})` })
      return
    }

    // Create refund request
    await supabaseAdmin.from('refund_requests').insert({
      order_id: orderId,
      buyer_id: buyerId,
      reason: reason.trim(),
    })

    // Mark order as disputed
    await supabaseAdmin
      .from('orders')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', orderId)

    // Reverse seller's pending wallet credit AND credit the buyer's wallet
    // with the full amount they paid. Funds remain on the platform's
    // Paystack balance, so we credit the buyer in-app rather than calling
    // Paystack /refund (which would double-pay).
    await walletService.reversePendingCredit(
      order.seller_id,
      order.buyer_id,
      orderId,
      Number(order.total_amount) || 0,
    )

    res.json({ success: true, message: 'Refund processed — the funds have been credited to your wallet.' })
  } catch (err) { next(err) }
})

export default router
