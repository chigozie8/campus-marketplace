import { supabaseAdmin } from '../config/supabaseClient.js'
import * as otpService from './otpService.js'
import * as appwriteEmail from './appwriteEmailService.js'
import * as smsService from './smsService.js'
import { notify, notifyAllAdmins } from './notificationService.js'
import logger from '../utils/logger.js'

export type SendDeliveryOtpResult = {
  success: boolean
  channel?: otpService.OtpChannel | 'in_app_only'
  reason?: string
}

async function getBuyerContact(buyerId: string): Promise<{ email: string | null; phone: string | null }> {
  const [profileResult, authResult] = await Promise.all([
    supabaseAdmin.from('profiles').select('email, phone_number').eq('id', buyerId).single(),
    supabaseAdmin.auth.admin.getUserById(buyerId),
  ])
  const email = profileResult.data?.email ?? authResult.data?.user?.email ?? null
  const phone = profileResult.data?.phone_number ?? null
  return { email, phone }
}

/**
 * Send delivery OTP to the buyer of an order. The OTP is delivered through
 * up to THREE independent channels:
 *
 *   1. SMS  — provider call (best effort)
 *   2. Email — Appwrite Email Token (best effort, generates its own code)
 *   3. In-app bell notification — ALWAYS fired, contains the same code as SMS
 *
 * The in-app bell is the guaranteed fallback: it works even when both email
 * and SMS providers are down. The buyer is logged in to confirm delivery
 * anyway, so showing the code in their authenticated bell adds no real
 * security risk vs. the convenience it provides.
 *
 * If email + SMS both fail, every admin is notified so a human can reach the
 * buyer. The 48h auto-release cron is the ultimate fallback.
 *
 * Used by:
 *  - Auto-trigger when seller marks an order as "shipped"
 *  - Manual resend endpoint (admin or system)
 */
export async function sendDeliveryOtpToBuyer(
  orderId: string,
  buyerId: string,
  preferredChannel: otpService.OtpChannel = 'both',
): Promise<SendDeliveryOtpResult> {
  const { email, phone } = await getBuyerContact(buyerId)

  const wantEmail = (preferredChannel === 'email' || preferredChannel === 'both') && !!email
  const wantSms = (preferredChannel === 'sms' || preferredChannel === 'both') && !!phone

  // Always generate a raw OTP — used by SMS, the in-app bell notification,
  // and stored (hashed) so the verify endpoint accepts this code regardless
  // of which external channel(s) actually delivered.
  const rawOtp = otpService.generateRawOtp()
  const otpHash = otpService.hashRawOtp(rawOtp)
  const appwriteUserId = orderId
  const shortOrderId = orderId.split('-')[0].toUpperCase()

  let smsSent = false
  let emailSent = false

  if (wantSms) {
    smsSent = await smsService.sendOtpSms(phone!, rawOtp, orderId, 'generic')
    if (!smsSent) logger.warn(`[deliveryOtp] SMS failed for order ${orderId}`)
  }

  if (wantEmail) {
    emailSent = await appwriteEmail.sendDeliveryOtpEmail(appwriteUserId, email!, orderId)
    if (!emailSent) logger.warn(`[deliveryOtp] Email failed for order ${orderId}`)
  }

  // Persist the OTP record so the verify endpoint accepts the code even if
  // every external channel failed (the buyer can still grab it from the bell).
  await otpService.createOtpRecord({
    orderId,
    channel: 'both',
    phone: phone ?? undefined,
    otpHash,
    appwriteUserId: wantEmail ? appwriteUserId : undefined,
  })

  // Channel #3 — always-on in-app bell. Guaranteed delivery surface.
  await notify({
    userId: buyerId,
    type: 'delivery_otp',
    title: '🔐 Your Delivery Code',
    body: `Use code ${rawOtp} to confirm delivery of Order #${shortOrderId}. Only enter it AFTER your item arrives. Expires in 10 minutes.`,
    data: { url: '/dashboard/orders', orderId, code: rawOtp },
  }).catch(err => logger.warn(`[deliveryOtp] Bell notification failed for order ${orderId}: ${err}`))

  // Email + SMS both failed → escalate to admins. Buyer still has the bell
  // notification + the 48h auto-release safety net.
  if (wantEmail && wantSms && !smsSent && !emailSent) {
    logger.error(`[deliveryOtp] EMAIL + SMS BOTH FAILED for order ${orderId} — buyer ${buyerId} can still retrieve code via in-app bell`)
    await notifyAllAdmins({
      type: 'admin_alert',
      title: '⚠️ Delivery OTP delivery failed',
      body: `Email + SMS both failed for Order #${shortOrderId}. Buyer (${buyerId.slice(0, 8)}) has been given the code via in-app bell, but please reach out to confirm.`,
      data: { url: `/admin/orders/${orderId}`, orderId, buyerId },
    })
    return { success: true, channel: 'in_app_only', reason: 'fallback_in_app_only' }
  }

  // No contact at all (no email AND no phone on profile) — bell-only.
  if (!wantEmail && !wantSms) {
    logger.warn(`[deliveryOtp] Buyer ${buyerId} has no email or phone for order ${orderId} — bell-only delivery`)
    await notifyAllAdmins({
      type: 'admin_alert',
      title: '⚠️ Buyer missing email + phone',
      body: `Order #${shortOrderId} buyer has no email or phone on file. Code was placed in their in-app bell only.`,
      data: { url: `/admin/orders/${orderId}`, orderId, buyerId },
    })
    return { success: true, channel: 'in_app_only', reason: 'no_contact_in_app_only' }
  }

  const effectiveChannel: otpService.OtpChannel =
    smsSent && emailSent ? 'both' : smsSent ? 'sms' : emailSent ? 'email' : 'both'

  logger.info(`[deliveryOtp] OTP sent to buyer ${buyerId} via ${effectiveChannel} + in-app bell for order ${orderId}`)
  return { success: true, channel: effectiveChannel }
}
