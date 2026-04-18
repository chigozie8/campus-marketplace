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

    const order = await orderService.updateOrderStatus(req.params.id, req.body.status)
    res.status(200).json({ success: true, message: 'Order status updated.', data: order })
  } catch (err) {
    next(err)
  }
}
