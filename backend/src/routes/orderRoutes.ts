import { Router } from 'express'
import * as orderController from '../controllers/orderController.js'
import { authenticate, requireRole } from '../middleware/authMiddleware.js'
import { validate } from '../validators/authValidator.js'
import { createOrderSchema, updateOrderStatusSchema } from '../validators/orderValidator.js'
import * as paymentService from '../services/paymentService.js'
import * as orderService from '../services/orderService.js'
import { AuthRequest } from '../types/index.js'

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

    const result = await paymentService.initializePayment({
      orderId: order.id,
      email: (req as AuthRequest).user.email,
      amount: order.total_amount,
    })

    res.status(200).json({ success: true, data: result })
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
