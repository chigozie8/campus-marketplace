import * as db from '../services/supabaseService.js'

export async function createOrder(req, res, next) {
  try {
    const order = await db.createOrder(req.user.id, req.body)
    return res.status(201).json({ success: true, message: 'Order created. Proceed to payment.', data: order })
  } catch (err) {
    next(err)
  }
}

export async function getMyOrders(req, res, next) {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 20
    const result = await db.getUserOrders(req.user.id, page, limit)
    return res.status(200).json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export async function getVendorOrders(req, res, next) {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 20
    const result = await db.getVendorOrders(req.user.id, page, limit)
    return res.status(200).json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export async function getOrderById(req, res, next) {
  try {
    const order = await db.getOrderById(req.params.id)

    // Only buyer, vendor of the order, or admin can view
    const userId = req.user.id
    const role = req.user.role
    if (role !== 'admin' && order.buyer_id !== userId && order.vendor_id !== userId) {
      const err = new Error('Access denied.')
      err.status = 403
      return next(err)
    }

    return res.status(200).json({ success: true, data: order })
  } catch (err) {
    next(err)
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body
    const order = await db.updateOrderStatus(req.params.id, status)
    return res.status(200).json({ success: true, message: 'Order status updated.', data: order })
  } catch (err) {
    next(err)
  }
}
