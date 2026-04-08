import { Router } from 'express'
import * as orderController from '../controllers/orderController.js'
import { authenticate, requireRole } from '../middleware/authMiddleware.js'
import { validate } from '../validators/authValidator.js'
import { createOrderSchema, updateOrderStatusSchema } from '../validators/orderValidator.js'
import * as paymentService from '../services/paymentService.js'
import * as orderService from '../services/orderService.js'
import * as payoutService from '../services/payoutService.js'
import { AuthRequest } from '../types/index.js'
import { supabaseAdmin } from '../config/supabaseClient.js'

const MILESTONES = [
  { score: 70, label: 'Trusted Buyer', emoji: '✅' },
  { score: 85, label: 'Verified Member', emoji: '⭐' },
  { score: 100, label: 'VendoorX Champion', emoji: '🏆' },
] as const

async function notifyBuyerMilestones(buyerId: string) {
  try {
    const [profileRes, ordersRes, disputesRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('id, created_at').eq('id', buyerId).single(),
      supabaseAdmin.from('orders').select('id, status').eq('buyer_id', buyerId),
      supabaseAdmin.from('order_disputes').select('id, status').eq('buyer_id', buyerId),
    ])

    if (!profileRes.data) return
    const profile = profileRes.data
    const orders = ordersRes.data ?? []
    const disputes = (disputesRes.data ?? []) as Array<{ id: string; status: string }>
    const completedOrders = orders.filter((o: { status: string }) => o.status === 'completed').length
    const accountAgeDays = Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))

    const base = 60
    const ordersBonus = Math.min(completedOrders * 2, 20)
    const noDisputeBonus = disputes.length === 0 ? 10 : 0
    const disputeLossPenalty = disputes.filter((d) => d.status === 'resolved_seller').length * 20
    const disputeWinPenalty = disputes.filter((d) => d.status === 'resolved_buyer').length * 5
    const ageBonus = accountAgeDays >= 180 ? 10 : accountAgeDays >= 90 ? 5 : 0
    const score = Math.max(0, Math.min(100, base + ordersBonus + noDisputeBonus - disputeLossPenalty - disputeWinPenalty + ageBonus))

    for (const milestone of MILESTONES) {
      if (score < milestone.score) continue
      const { data: existing } = await supabaseAdmin
        .from('notifications')
        .select('id')
        .eq('user_id', buyerId)
        .eq('title', `🏅 ${milestone.label} Unlocked!`)
        .limit(1)
        .single()
      if (!existing) {
        await supabaseAdmin.from('notifications').insert({
          user_id: buyerId,
          title: `🏅 ${milestone.label} Unlocked!`,
          message: `Congratulations! You've reached a trust score of ${milestone.score}+ and earned the ${milestone.emoji} ${milestone.label} badge. Keep it up!`,
          type: 'system',
        })
      }
    }
  } catch {
    // Non-critical
  }
}

const router = Router()
router.use(authenticate)

router.post('/', validate(createOrderSchema), orderController.createOrder)
router.get('/me', orderController.getMyOrders)
router.get('/vendor/dashboard', requireRole('vendor', 'admin'), orderController.getVendorOrders)
router.get('/:id', orderController.getOrderById)

router.patch(
  '/:id/status',
  requireRole('vendor', 'admin'),
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus
)

router.post('/:id/pay', async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id)
    const userId = (req as AuthRequest).user.id

    if (order.buyer_id !== userId) {
      res.status(403).json({ success: false, message: 'You can only pay for your own orders.' })
      return
    }
    if (order.status !== 'pending') {
      res.status(400).json({ success: false, message: `Order is already ${order.status}.` })
      return
    }

    // Fetch seller's Paystack subaccount (if they've set up payouts)
    const sellerSubaccountCode = await payoutService.getSellerSubaccountCode(order.seller_id)

    const result = await paymentService.initializePayment({
      orderId: order.id,
      email: (req as AuthRequest).user.email,
      amount: order.total_amount,
      sellerSubaccountCode: sellerSubaccountCode ?? undefined,
    })

    res.status(200).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
})

// Buyer confirms delivery — releases escrow to seller
router.post('/:id/confirm-delivery', async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id)
    const userId = (req as AuthRequest).user.id

    if (order.buyer_id !== userId) {
      res.status(403).json({ success: false, message: 'Only the buyer can confirm delivery.' })
      return
    }
    if (order.status !== 'delivered') {
      res.status(400).json({ success: false, message: `Cannot confirm delivery — order status is "${order.status}".` })
      return
    }

    const updated = await orderService.updateOrderStatus(order.id, 'completed')
    // Fire-and-forget milestone notification check
    notifyBuyerMilestones(userId).catch(() => {})
    res.status(200).json({ success: true, data: updated, message: 'Delivery confirmed! Funds released to seller.' })
  } catch (err) {
    next(err)
  }
})

router.get('/verify/:reference', async (req, res, next) => {
  try {
    const transaction = await paymentService.verifyPayment(req.params.reference)

    if (transaction.status === 'success') {
      const order = await orderService.getOrderByReference(req.params.reference)
      if (order && order.status === 'pending') {
        await orderService.updateOrderStatus(order.id, 'paid')
      }
      res.status(200).json({ success: true, message: 'Payment verified. Order marked as paid.', data: transaction })
      return
    }

    res.status(400).json({ success: false, message: 'Payment not successful.', data: transaction })
  } catch (err) {
    next(err)
  }
})

export default router
