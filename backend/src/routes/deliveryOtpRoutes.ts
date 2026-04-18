import { Router } from 'express'
import { authenticate, requireRole } from '../middleware/authMiddleware.js'
import { AuthRequest } from '../types/index.js'
import * as orderService from '../services/orderService.js'
import * as otpService from '../services/otpService.js'
import * as appwriteEmail from '../services/appwriteEmailService.js'
import * as smsService from '../services/smsService.js'
import { sendDeliveryOtpToBuyer } from '../services/deliveryOtpService.js'
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
    if (!res.ok) logger.warn(`[milestones] trigger failed for ${userId} (${role}): HTTP ${res.status}`)
  } catch (err) {
    logger.warn(`[milestones] trigger error for ${userId}: ${err}`)
  }
}

/** Fetch buyer email + phone from Supabase in one go */
async function getBuyerContact(buyerId: string): Promise<{ email: string | null; phone: string | null }> {
  const [profileResult, authResult] = await Promise.all([
    supabaseAdmin.from('profiles').select('email, phone_number').eq('id', buyerId).single(),
    supabaseAdmin.auth.admin.getUserById(buyerId),
  ])
  const email = profileResult.data?.email ?? authResult.data?.user?.email ?? null
  const phone = profileResult.data?.phone_number ?? null
  return { email, phone }
}

// ---------------------------------------------------------------------------
// POST /api/delivery-otp/:orderId/request?channel=email|sms|both
// ADMIN ONLY. Sellers can no longer mark orders delivered — when they mark
// "shipped", orderService auto-sends the OTP to the buyer. This endpoint is
// kept for support staff to manually (re)issue an OTP if delivery failed.
// ---------------------------------------------------------------------------
router.post('/:orderId/request', requireRole('admin'), async (req, res, next) => {
  try {
    const { orderId } = req.params
    const adminId = (req as AuthRequest).user.id
    const channel = (['email', 'sms', 'both'].includes(req.query.channel as string)
      ? req.query.channel as otpService.OtpChannel
      : 'both')

    const order = await orderService.getOrderById(orderId)

    // Order must already be shipped — we no longer flip status to "delivered"
    // from this endpoint, since sellers cannot influence delivery confirmation.
    if (order.status !== 'shipped' && order.status !== 'delivered') {
      res.status(400).json({
        success: false,
        message: `Cannot send delivery OTP — order status is "${order.status}". Order must be shipped first.`,
      })
      return
    }

    // Delegate to the shared sender — same code path as the auto-trigger when
    // a seller marks shipped. Admin-issued OTPs therefore also land in the
    // buyer's in-app bell (guaranteed fallback) and follow the same logging /
    // admin-alert rules if external channels fail.
    const result = await sendDeliveryOtpToBuyer(orderId, order.buyer_id, channel)

    if (!result.success) {
      res.status(502).json({
        success: false,
        message: 'Failed to send delivery OTP. Please retry or check buyer contact details.',
      })
      return
    }

    logger.info(`[deliveryOtp] Admin ${adminId} issued OTP for order ${orderId} via ${result.channel}`)

    res.status(200).json({
      success: true,
      channel: result.channel,
      message: result.channel === 'in_app_only'
        ? 'External channels failed — code delivered to buyer\'s in-app notifications only.'
        : `Delivery OTP sent to buyer via ${result.channel} + in-app bell notification.`,
    })
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// POST /api/delivery-otp/:orderId/verify
// Buyer submits their 6-digit code. Verification method depends on channel.
// ---------------------------------------------------------------------------
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

    if (order.status !== 'shipped' && order.status !== 'delivered') {
      res.status(400).json({
        success: false,
        message: `Cannot verify delivery — order status is "${order.status}". The order must be shipped first.`,
      })
      return
    }

    const record = await otpService.getOtpRecord(orderId)

    if (!record) {
      res.status(400).json({ success: false, message: 'No delivery OTP found for this order. Ask the vendor to resend.' })
      return
    }
    if (record.used) {
      res.status(400).json({ success: false, message: 'This OTP has already been used.' })
      return
    }
    if (new Date() > new Date(record.expires_at)) {
      res.status(400).json({
        success: false,
        message: 'OTP has expired. Please ask the vendor to generate a new one.',
        reason: 'expired',
      })
      return
    }

    let verified = false

    if (record.channel === 'email') {
      // --- Email-only: verify via Appwrite ---
      if (!record.appwrite_user_id) {
        res.status(500).json({ success: false, message: 'OTP record corrupted. Ask the vendor to resend.' })
        return
      }
      const result = await appwriteEmail.verifyDeliveryOtpEmail(record.appwrite_user_id, otp.trim())
      if (!result.success) {
        const messages: Record<string, string> = {
          invalid: 'Invalid code. Check your email and try again.',
          used: 'This code has already been used.',
          error: 'Verification failed. Ask the vendor to resend.',
        }
        res.status(400).json({
          success: false,
          message: messages[result.reason ?? 'error'] ?? 'OTP verification failed.',
          reason: result.reason,
        })
        return
      }
      verified = true

    } else if (record.channel === 'sms') {
      // --- SMS-only: verify by hash ---
      const result = await otpService.verifyHashOtp(record, otp.trim())
      if (!result.success) {
        const messages: Record<string, string> = {
          not_found: 'No OTP found. Ask the vendor to resend.',
          expired: 'OTP has expired. Ask the vendor to generate a new one.',
          used: 'This OTP has already been used.',
          invalid: 'Invalid code. Check your SMS and try again.',
          max_attempts: 'Too many failed attempts. Ask the vendor to generate a new OTP.',
        }
        res.status(400).json({
          success: false,
          message: messages[result.reason] ?? 'OTP verification failed.',
          reason: result.reason,
        })
        return
      }
      verified = true

    } else if (record.channel === 'both') {
      // --- Both channels: accept whichever code is entered ---
      // Try email (Appwrite) first if available
      if (record.appwrite_user_id) {
        const emailResult = await appwriteEmail.verifyDeliveryOtpEmail(record.appwrite_user_id, otp.trim())
        if (emailResult.success) verified = true
      }
      // Try SMS hash if email didn't match (or wasn't used)
      if (!verified && record.otp_hash) {
        const smsResult = await otpService.verifyHashOtp(record, otp.trim())
        if (smsResult.success) verified = true
      }
      if (!verified) {
        res.status(400).json({
          success: false,
          message: 'Invalid code. Check your email or SMS and try again.',
          reason: 'invalid',
        })
        return
      }
    }

    if (!verified) {
      res.status(400).json({ success: false, message: 'OTP verification failed.' })
      return
    }

    await otpService.markOtpUsed(orderId)
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

// ---------------------------------------------------------------------------
// POST /api/delivery-otp/:orderId/resend?channel=email|sms|both
// Vendor resends OTP (optionally changing channel).
// ---------------------------------------------------------------------------
router.post('/:orderId/resend', requireRole('admin'), async (req, res, next) => {
  try {
    const { orderId } = req.params
    const adminId = (req as AuthRequest).user.id

    const order = await orderService.getOrderById(orderId)

    if (order.status !== 'shipped' && order.status !== 'delivered') {
      res.status(400).json({ success: false, message: `Cannot resend OTP — order status is "${order.status}".` })
      return
    }

    // Fall back to previously used channel if none specified
    const existingRecord = await otpService.getOtpRecord(orderId)
    const channel = (['email', 'sms', 'both'].includes(req.query.channel as string)
      ? req.query.channel as otpService.OtpChannel
      : existingRecord?.channel ?? 'both')

    const result = await sendDeliveryOtpToBuyer(orderId, order.buyer_id, channel)

    if (!result.success) {
      res.status(502).json({ success: false, message: 'Failed to resend OTP. Please retry or check buyer contact details.' })
      return
    }

    logger.info(`[deliveryOtp] Admin ${adminId} resent OTP for order ${orderId} via ${result.channel}`)

    res.status(200).json({
      success: true,
      channel: result.channel,
      message: result.channel === 'in_app_only'
        ? 'External channels failed — code delivered to buyer\'s in-app notifications only.'
        : `Delivery OTP resent to buyer via ${result.channel} + in-app bell notification.`,
    })
  } catch (err) {
    next(err)
  }
})

export default router
