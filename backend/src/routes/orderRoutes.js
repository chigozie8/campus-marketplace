import { Router } from 'express'
import * as orderController from '../controllers/orderController.js'
import { authenticate, requireRole } from '../middleware/authMiddleware.js'
import { validate } from '../validators/authValidator.js'
import { createOrderSchema, updateOrderStatusSchema } from '../validators/orderValidator.js'
import * as paymentService from '../services/paymentService.js'
import * as db from '../services/supabaseService.js'

const router = Router()

// All order routes require authentication
router.use(authenticate)

// Buyer
router.post('/', validate(createOrderSchema), orderController.createOrder)
router.get('/me', orderController.getMyOrders)
router.get('/:id', orderController.getOrderById)

// Vendor dashboard
router.get('/vendor/dashboard', requireRole('vendor', 'admin'), orderController.getVendorOrders)

// Status update — vendor or admin
router.patch('/:id/status', requireRole('vendor', 'admin'), validate(updateOrderStatusSchema), orderController.updateOrderStatus)

// Initiate payment for an order
router.post('/:id/pay', async (req, res, next) => {
  try {
    const order = await db.getOrderById(req.params.id)

    if (order.buyer_id !== req.user.id) {
      const err = new Error('You can only pay for your own orders.')
      err.status = 403
      return next(err)
    }
    if (order.status !== 'pending') {
      const err = new Error(`Order is already ${order.status}.`)
      err.status = 400
      return next(err)
    }

    const result = await paymentService.initializePayment({
      orderId: order.id,
      email: req.user.email,
      amount: order.total_amount,
    })

    return res.status(200).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
})

// Verify payment (after Paystack redirect)
router.get('/verify/:reference', async (req, res, next) => {
  try {
    const transaction = await paymentService.verifyPayment(req.params.reference)

    if (transaction.status === 'success') {
      const order = await db.getOrderByReference(req.params.reference)
      if (order && order.status === 'pending') {
        await db.updateOrderStatus(order.id, 'paid')
      }
      return res.status(200).json({ success: true, message: 'Payment verified. Order marked as paid.', data: transaction })
    }

    return res.status(400).json({ success: false, message: 'Payment not successful.', data: transaction })
  } catch (err) {
    next(err)
  }
})

export default router
