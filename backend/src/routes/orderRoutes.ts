import { Router } from 'express'
import * as orderController from '../controllers/orderController.js'
import { authenticate, requireRole } from '../middleware/authMiddleware.js'
import { validate } from '../validators/authValidator.js'
import { createOrderSchema, updateOrderStatusSchema, setDeliveryDurationSchema, setTrackingSchema } from '../validators/orderValidator.js'
import * as paymentService from '../services/paymentService.js'
import * as orderService from '../services/orderService.js'
import * as payoutService from '../services/payoutService.js'
import { AuthRequest } from '../types/index.js'
import logger from '../utils/logger.js'

async function triggerMilestoneCheck(userId: string, role: 'buyer' | 'seller' | 'both') {
  try {
    const appUrl = process.env.FRONTEND_URL ?? process.env.APP_URL ?? 'http://localhost:5000'
    const res = await fetch(`${appUrl}/api/internal/check-milestones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': process.env.INTERNAL_API_KEY ?? '',
      },
      body: JSON.stringify({ userId, role }),
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) {
      logger.warn(`[milestones] trigger failed for ${userId} (${role}): HTTP ${res.status}`)
    }
  } catch (err) {
    logger.warn(`[milestones] trigger error for ${userId} (${role}): ${err}`)
  }
}

const router = Router()

// ── Public: payment verification ─────────────────────────────────────────────
// No auth required — the Paystack reference is a secret, unguessable token.
// This is called by the Next.js server after Paystack redirects the buyer back.
router.get('/verify/:reference', async (req, res, next) => {
  try {
    const transaction = await paymentService.verifyPayment(req.params.reference)
    const order = await orderService.getOrderByReference(req.params.reference)

    if (transaction.status === 'success') {
      if (order && order.status === 'pending') {
        await orderService.updateOrderStatus(order.id, 'paid')
        logger.info(`[orderRoutes] Order ${order.id} marked as paid via verify endpoint.`)
      }

      return res.status(200).json({
        success: true,
        message: 'Payment verified. Order marked as paid.',
        data: {
          status: transaction.status,
          amount: transaction.amount,
          order_id: order?.id ?? null,
          metadata: transaction.metadata,
        },
      })
    }

    return res.status(200).json({
      success: false,
      message: 'Payment not successful.',
      data: {
        status: transaction.status,
        amount: transaction.amount,
        order_id: order?.id ?? null,
        metadata: transaction.metadata,
      },
    })
  } catch (err) {
    next(err)
  }
})

// ── All routes below require authentication ───────────────────────────────────
router.use(authenticate)

router.post('/', validate(createOrderSchema), orderController.createOrder)
router.get('/me', orderController.getMyOrders)
// Any authenticated user can hit this — the query is filtered by seller_id =
// req.user.id, so non-sellers simply receive an empty list. We previously
// gated this with requireRole('vendor','admin'), but that broke for users
// whose profiles.is_seller flag was never set (most existing sellers).
router.get('/vendor/dashboard', orderController.getVendorOrders)

router.patch(
  '/:id/status',
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus
)

router.patch(
  '/:id/delivery-duration',
  validate(setDeliveryDurationSchema),
  orderController.setDeliveryDuration
)

router.patch(
  '/:id/tracking',
  validate(setTrackingSchema),
  orderController.setOrderTracking
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
    triggerMilestoneCheck(userId, 'buyer').catch(() => {})
    triggerMilestoneCheck(order.seller_id, 'seller').catch(() => {})
    res.status(200).json({ success: true, data: updated, message: 'Delivery confirmed! Funds released to seller.' })
  } catch (err) {
    next(err)
  }
})

// Keep /:id last — it's a catch-all for GET order by ID
router.get('/:id', orderController.getOrderById)

export default router
