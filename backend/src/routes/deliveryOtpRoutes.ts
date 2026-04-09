import { Router } from 'express'
import { authenticate, requireRole } from '../middleware/authMiddleware.js'
import { AuthRequest } from '../types/index.js'
import * as orderService from '../services/orderService.js'
import * as otpService from '../services/otpService.js'
import * as smsService from '../services/smsService.js'
import { supabaseAdmin } from '../config/supabaseClient.js'
import logger from '../utils/logger.js'

const router = Router()
router.use(authenticate)

async function triggerMilestoneCheck(userId: string, role: 'buyer' | 'seller'): Promise<void> {
  try {
    const appUrl = process.env.FRONTEND_URL ?? 'http://localhost:5000'
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
    logger.warn(`[milestones] trigger error for ${userId}: ${err}`)
  }
}

/**
 * POST /api/delivery-otp/:orderId/request
 * Vendor calls this after physically delivering the item.
 * Generates an OTP and sends it to the buyer via SMS/WhatsApp.
 * Also updates order status to "delivered".
 */
router.post('/:orderId/request', requireRole('vendor', 'admin'), async (req, res, next) => {
  try {
    const { orderId } = req.params
    const vendorId = (req as AuthRequest).user.id

    const order = await orderService.getOrderById(orderId)

    if (order.seller_id !== vendorId && (req as AuthRequest).user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Only the vendor of this order can request delivery OTP.' })
      return
    }

    if (!['paid', 'shipped'].includes(order.status)) {
      res.status(400).json({
        success: false,
        message: `Cannot request delivery OTP — order status is "${order.status}". Order must be paid or shipped.`,
      })
      return
    }

    const { data: buyerProfile, error } = await supabaseAdmin
      .from('profiles')
      .select('phone_number, full_name')
      .eq('id', order.buyer_id)
      .single()

    if (error || !buyerProfile?.phone_number) {
      res.status(400).json({
        success: false,
        message: 'Buyer does not have a phone number on file. Cannot send OTP.',
      })
      return
    }

    const otp = await otpService.createOtp(orderId, buyerProfile.phone_number)

    const channel = (req.query.channel as smsService.SmsChannel) ?? 'generic'
    const sent = await smsService.sendOtpSms(buyerProfile.phone_number, otp, orderId, channel)

    if (!sent) {
      res.status(502).json({
        success: false,
        message: 'OTP generated but failed to send via SMS. Please retry.',
      })
      return
    }

    await orderService.updateOrderStatus(orderId, 'delivered')

    logger.info(`[deliveryOtp] OTP sent to buyer ${order.buyer_id} for order ${orderId}`)

    res.status(200).json({
      success: true,
      message: `Delivery OTP sent to buyer's phone (${buyerProfile.phone_number.slice(0, 4)}****${buyerProfile.phone_number.slice(-3)}) via ${channel}.`,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/delivery-otp/:orderId/verify
 * Buyer submits their OTP to confirm delivery.
 * On success, escrow is released to the seller.
 */
router.post('/:orderId/verify', requireRole('buyer', 'admin'), async (req, res, next) => {
  try {
    const { orderId } = req.params
    const { otp } = req.body
    const buyerId = (req as AuthRequest).user.id

    if (!otp || typeof otp !== 'string' || otp.trim().length === 0) {
      res.status(400).json({ success: false, message: 'OTP is required.' })
      return
    }

    const order = await orderService.getOrderById(orderId)

    if (order.buyer_id !== buyerId && (req as AuthRequest).user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Only the buyer of this order can verify delivery.' })
      return
    }

    if (order.status !== 'delivered') {
      res.status(400).json({
        success: false,
        message: `Cannot verify delivery — order status is "${order.status}". Vendor must mark order as delivered first.`,
      })
      return
    }

    const result = await otpService.verifyOtp(orderId, otp.trim())

    if (!result.success) {
      const messages: Record<string, string> = {
        not_found: 'No OTP found for this order. Please ask the vendor to resend.',
        expired: 'OTP has expired. Please ask the vendor to generate a new one.',
        used: 'This OTP has already been used.',
        invalid: 'Invalid OTP. Please check and try again.',
        max_attempts: 'Too many failed attempts. Please ask the vendor to generate a new OTP.',
      }
      res.status(400).json({
        success: false,
        message: messages[result.reason] ?? 'OTP verification failed.',
        reason: result.reason,
      })
      return
    }

    const updated = await orderService.updateOrderStatus(orderId, 'completed')

    triggerMilestoneCheck(buyerId, 'buyer').catch(() => {})
    triggerMilestoneCheck(order.seller_id, 'seller').catch(() => {})

    logger.info(`[deliveryOtp] Order ${orderId} confirmed by buyer ${buyerId} — escrow released to seller ${order.seller_id}`)

    res.status(200).json({
      success: true,
      message: 'Delivery confirmed! Funds released to seller.',
      data: updated,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/delivery-otp/:orderId/resend
 * Vendor can resend OTP if buyer didn't receive it.
 */
router.post('/:orderId/resend', requireRole('vendor', 'admin'), async (req, res, next) => {
  try {
    const { orderId } = req.params
    const vendorId = (req as AuthRequest).user.id

    const order = await orderService.getOrderById(orderId)

    if (order.seller_id !== vendorId && (req as AuthRequest).user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Only the vendor of this order can resend the OTP.' })
      return
    }

    if (order.status !== 'delivered') {
      res.status(400).json({
        success: false,
        message: `Cannot resend OTP — order status is "${order.status}".`,
      })
      return
    }

    const { data: buyerProfile, error } = await supabaseAdmin
      .from('profiles')
      .select('phone_number')
      .eq('id', order.buyer_id)
      .single()

    if (error || !buyerProfile?.phone_number) {
      res.status(400).json({ success: false, message: 'Buyer phone number not found.' })
      return
    }

    const otp = await otpService.createOtp(orderId, buyerProfile.phone_number)
    const channel = (req.query.channel as smsService.SmsChannel) ?? 'generic'
    const sent = await smsService.sendOtpSms(buyerProfile.phone_number, otp, orderId, channel)

    if (!sent) {
      res.status(502).json({ success: false, message: 'Failed to resend OTP. Please retry.' })
      return
    }

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully.',
    })
  } catch (err) {
    next(err)
  }
})

export default router
