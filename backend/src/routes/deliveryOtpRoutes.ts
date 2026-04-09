import { Router } from 'express'
import { authenticate, requireRole } from '../middleware/authMiddleware.js'
import { AuthRequest } from '../types/index.js'
import * as orderService from '../services/orderService.js'
import * as otpService from '../services/otpService.js'
import * as appwriteEmail from '../services/appwriteEmailService.js'
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
 * Vendor marks item delivered → Appwrite sends a 6-digit OTP to the buyer's email.
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
      .select('email, full_name')
      .eq('id', order.buyer_id)
      .single()

    const buyerEmail = buyerProfile?.email
      ?? (await supabaseAdmin.auth.admin.getUserById(order.buyer_id))?.data?.user?.email

    if (error || !buyerEmail) {
      res.status(400).json({
        success: false,
        message: 'Buyer email not found. Cannot send OTP.',
      })
      return
    }

    // Use orderId as the deterministic Appwrite userId — isolated per order
    const appwriteUserId = orderId

    const sent = await appwriteEmail.sendDeliveryOtpEmail(appwriteUserId, buyerEmail, orderId)

    if (!sent) {
      res.status(502).json({
        success: false,
        message: 'Failed to send delivery OTP email. Please retry.',
      })
      return
    }

    await otpService.createAppwriteOtpRecord(orderId, appwriteUserId)
    await orderService.updateOrderStatus(orderId, 'delivered')

    const maskedEmail = buyerEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    logger.info(`[deliveryOtp] Appwrite email OTP sent to buyer ${order.buyer_id} for order ${orderId}`)

    res.status(200).json({
      success: true,
      message: `Delivery OTP sent to buyer's email (${maskedEmail}).`,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/delivery-otp/:orderId/verify
 * Buyer submits the 6-digit code from their email → Appwrite verifies → escrow released.
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

    const record = await otpService.getAppwriteOtpRecord(orderId)

    if (!record) {
      res.status(400).json({
        success: false,
        message: 'No delivery OTP found for this order. Ask the vendor to resend.',
      })
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

    if (!record.appwrite_user_id) {
      res.status(500).json({ success: false, message: 'OTP record corrupted. Please ask the vendor to resend.' })
      return
    }

    const result = await appwriteEmail.verifyDeliveryOtpEmail(record.appwrite_user_id, otp.trim())

    if (!result.success) {
      const messages: Record<string, string> = {
        invalid: 'Invalid code — please check your email and try again.',
        used: 'This code has already been used.',
        error: 'Verification failed. Please ask the vendor to resend the OTP.',
      }
      res.status(400).json({
        success: false,
        message: messages[result.reason ?? 'error'] ?? 'OTP verification failed.',
        reason: result.reason,
      })
      return
    }

    await otpService.markAppwriteOtpUsed(orderId)
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
 * Vendor requests a new OTP email for the buyer.
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

    const buyerEmail =
      (await supabaseAdmin.from('profiles').select('email').eq('id', order.buyer_id).single())?.data?.email
      ?? (await supabaseAdmin.auth.admin.getUserById(order.buyer_id))?.data?.user?.email

    if (!buyerEmail) {
      res.status(400).json({ success: false, message: 'Buyer email not found.' })
      return
    }

    const appwriteUserId = orderId
    const sent = await appwriteEmail.sendDeliveryOtpEmail(appwriteUserId, buyerEmail, orderId)

    if (!sent) {
      res.status(502).json({ success: false, message: 'Failed to resend OTP email. Please retry.' })
      return
    }

    await otpService.createAppwriteOtpRecord(orderId, appwriteUserId)

    res.status(200).json({ success: true, message: 'Delivery OTP resent to buyer\'s email.' })
  } catch (err) {
    next(err)
  }
})

export default router
