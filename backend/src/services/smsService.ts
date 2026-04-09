import logger from '../utils/logger.js'

const TERMII_BASE_URL = 'https://api.ng.termii.com/api'

export type SmsChannel = 'dnd' | 'whatsapp' | 'generic'

interface TermiiSendResponse {
  message_id?: string
  message?: string
  balance?: number
  user?: string
  code?: string
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0') && digits.length === 11) {
    return `234${digits.slice(1)}`
  }
  if (digits.startsWith('234')) return digits
  if (digits.length === 10) return `234${digits}`
  return digits
}

export async function sendOtpSms(
  phone: string,
  otp: string,
  orderId: string,
  channel: SmsChannel = 'generic'
): Promise<boolean> {
  const apiKey = process.env.TERMII_API_KEY

  if (!apiKey) {
    logger.warn('[smsService] TERMII_API_KEY not set — OTP will be logged only (dev mode)')
    logger.info(`[smsService] [DEV] OTP for order ${orderId} → phone ${phone}: ${otp}`)
    return true
  }

  const formattedPhone = formatPhone(phone)

  const payload = {
    to: formattedPhone,
    from: process.env.TERMII_SENDER_ID ?? 'VendoorX',
    sms: `Your VendoorX delivery OTP is: ${otp}. Valid for 10 minutes. Do NOT share this code with anyone. Order ref: ${orderId.slice(0, 8).toUpperCase()}`,
    type: 'plain',
    channel,
    api_key: apiKey,
  }

  try {
    const res = await fetch(`${TERMII_BASE_URL}/sms/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    })

    const data: TermiiSendResponse = await res.json()

    if (!res.ok || data.code === 'error') {
      logger.error(`[smsService] Termii send failed for ${formattedPhone}: ${JSON.stringify(data)}`)
      return false
    }

    logger.info(`[smsService] OTP sent via ${channel} to ${formattedPhone} for order ${orderId} — msg_id: ${data.message_id}`)
    return true
  } catch (err) {
    logger.error(`[smsService] Termii request error: ${err}`)
    return false
  }
}

export async function sendWhatsAppOtp(phone: string, otp: string, orderId: string): Promise<boolean> {
  return sendOtpSms(phone, otp, orderId, 'whatsapp')
}
