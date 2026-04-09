import { Router } from 'express'
import * as orderController from '../controllers/orderController.js'
import { authenticate, requireRole } from '../middleware/authMiddleware.js'
import { validate } from '../validators/authValidator.js'
import { createOrderSchema, updateOrderStatusSchema } from '../validators/orderValidator.js'
import * as paymentService from '../services/paymentService.js'
import * as orderService from '../services/orderService.js'
import * as payoutService from '../services/payoutService.js'
import { AuthRequest } from '../types/index.js'

/**
 * Delegate milestone checking to the canonical Next.js internal endpoint.
 * This avoids duplicating the trust computation logic in the backend.
 */
async function triggerMilestoneCheck(userId: string, role: 'buyer' | 'seller' | 'both') {
  try {
    const appUrl = process.env.FRONTEND_URL ?? process.env.APP_URL ?? 'http://localhost:5000'
    await fetch(`${appUrl}/api/internal/check-milestones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': process.env.INTERNAL_API_KEY ?? '',
      },
      body: JSON.stringify({ userId, role }),
      signal: AbortSignal.timeout(4000),
    })
  } catch {
    // Non-critical — milestone notifications are best-effort
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
    // Fire-and-forget: check milestones for buyer and seller via canonical endpoint
    triggerMilestoneCheck(userId, 'buyer').catch(() => {})
    triggerMilestoneCheck(order.seller_id, 'seller').catch(() => {})
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
