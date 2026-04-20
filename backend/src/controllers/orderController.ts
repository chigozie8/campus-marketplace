import { Request, Response, NextFunction } from 'express'
import * as orderService from '../services/orderService.js'
import { AuthRequest } from '../types/index.js'

export async function createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const order = await orderService.createOrder((req as AuthRequest).user.id, req.body)
    res.status(201).json({ success: true, message: 'Order created. Proceed to payment.', data: order })
  } catch (err) {
    next(err)
  }
}

export async function getMyOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 20
    const result = await orderService.getUserOrders((req as AuthRequest).user.id, page, limit)
    res.status(200).json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export async function getVendorOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 20
    const result = await orderService.getVendorOrders((req as AuthRequest).user.id, page, limit)
    res.status(200).json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export async function getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const order = await orderService.getOrderById(req.params.id)
    const userId = (req as AuthRequest).user.id
    const role = (req as AuthRequest).user.role

    if (role !== 'admin' && order.buyer_id !== userId && order.vendor_id !== userId) {
      res.status(403).json({ success: false, message: 'Access denied.' })
      return
    }

    res.status(200).json({ success: true, data: order })
  } catch (err) {
    next(err)
  }
}

export async function updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).user.id
    const role = (req as AuthRequest).user.role

    // Verify the caller actually owns this order as the seller (or is admin).
    // Replaces the previous requireRole gate which depended on the brittle
    // profiles.is_seller flag.
    const existing = await orderService.getOrderById(req.params.id)
    if (role !== 'admin' && existing.seller_id !== userId) {
      res.status(403).json({ success: false, message: 'Only the seller can update this order.' })
      return
    }

    // Fraud prevention: sellers may only mark "shipped" or "cancelled".
    // Marking "delivered" or "completed" must come from the buyer (delivery
    // OTP verification) or the escrow auto-release job — never the seller.
    const requested = req.body.status
    const sellerAllowed: ReadonlyArray<string> = ['shipped', 'cancelled']
    if (role !== 'admin' && !sellerAllowed.includes(requested)) {
      res.status(403).json({
        success: false,
        message: 'Sellers can only mark orders as shipped or cancelled. Delivery confirmation is handled by the buyer or the escrow system to protect everyone.',
      })
      return
    }

    const order = await orderService.updateOrderStatus(req.params.id, requested)
    res.status(200).json({ success: true, message: 'Order status updated.', data: order })
  } catch (err) {
    next(err)
  }
}

export async function setOrderTracking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).user.id
    const role = (req as AuthRequest).user.role

    const existing = await orderService.getOrderById(req.params.id)
    if (role !== 'admin' && existing.seller_id !== userId) {
      res.status(403).json({ success: false, message: 'Only the seller can set tracking info for this order.' })
      return
    }

    if (existing.status === 'pending' || existing.status === 'cancelled') {
      res.status(400).json({
        success: false,
        message: `Cannot set tracking on a ${existing.status} order.`,
      })
      return
    }

    const { tracking_number, tracking_courier } = req.body
    const order = await orderService.setOrderTracking(
      req.params.id,
      tracking_number ?? null,
      tracking_courier ?? null,
    )
    res.status(200).json({ success: true, message: 'Tracking info saved.', data: order })
  } catch (err) {
    next(err)
  }
}

export async function setDeliveryDuration(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).user.id
    const role = (req as AuthRequest).user.role

    const existing = await orderService.getOrderById(req.params.id)

    // Only the seller (or admin) may set the delivery window
    if (role !== 'admin' && existing.seller_id !== userId) {
      res.status(403).json({ success: false, message: 'Only the seller can set the delivery window for this order.' })
      return
    }

    // Only meaningful while the order is paid and not yet shipped
    if (existing.status !== 'paid') {
      res.status(400).json({
        success: false,
        message: `You can only set a delivery window while the order is awaiting shipment. Current status: ${existing.status}.`,
      })
      return
    }

    const order = await orderService.setDeliveryDuration(req.params.id, req.body.days)
    res.status(200).json({ success: true, message: 'Delivery window saved. The buyer has been notified.', data: order })
  } catch (err) {
    next(err)
  }
}
