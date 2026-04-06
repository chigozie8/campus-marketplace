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

    // Reverse seller's pending wallet credit
    await walletService.reversePendingCredit(order.seller_id, orderId)

    // Issue Paystack refund if payment was made
    if (order.payment_ref) {
      try {
        const paystackKey = process.env.PAYSTACK_SECRET_KEY
        await fetch('https://api.paystack.co/refund', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${paystackKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ transaction: order.payment_ref }),
        })
      } catch {
        // Log but don't fail — admin can process manually
      }
    }

    res.json({ success: true, message: 'Refund request submitted. We\'ll process it within 3–5 business days.' })
  } catch (err) { next(err) }
})

export default router
