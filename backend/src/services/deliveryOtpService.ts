import { supabaseAdmin } from '../config/supabaseClient.js'
import * as otpService from './otpService.js'
import * as appwriteEmail from './appwriteEmailService.js'
import * as smsService from './smsService.js'
import logger from '../utils/logger.js'

export type SendDeliveryOtpResult = {
  success: boolean
  channel?: otpService.OtpChannel
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
 * Send delivery OTP to the buyer of an order. Tries email + SMS where
 * available. Returns success if at least one channel succeeded.
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

  if (!wantEmail && !wantSms) {
    logger.warn(`[deliveryOtp] Buyer ${buyerId} has no email or phone for order ${orderId}`)
    return { success: false, reason: 'no_contact' }
  }

  const appwriteUserId = orderId
  let smsSent = false
  let emailSent = false
  let otpHash: string | null = null

  if (wantSms) {
    const rawOtp = otpService.generateRawOtp()
    otpHash = otpService.hashRawOtp(rawOtp)
    smsSent = await smsService.sendOtpSms(phone!, rawOtp, orderId, 'generic')
    if (!smsSent) logger.warn(`[deliveryOtp] SMS failed for order ${orderId}`)
  }

  if (wantEmail) {
    emailSent = await appwriteEmail.sendDeliveryOtpEmail(appwriteUserId, email!, orderId)
    if (!emailSent) logger.warn(`[deliveryOtp] Email failed for order ${orderId}`)
  }

  if (!smsSent && !emailSent) {
    return { success: false, reason: 'send_failed' }
  }

  const effectiveChannel: otpService.OtpChannel =
    smsSent && emailSent ? 'both' : smsSent ? 'sms' : 'email'

  await otpService.createOtpRecord({
    orderId,
    channel: effectiveChannel,
    phone: phone ?? undefined,
    otpHash: otpHash ?? undefined,
    appwriteUserId: (effectiveChannel === 'email' || effectiveChannel === 'both') ? appwriteUserId : undefined,
  })

  logger.info(`[deliveryOtp] OTP auto-sent to buyer ${buyerId} via ${effectiveChannel} for order ${orderId}`)
  return { success: true, channel: effectiveChannel }
}
