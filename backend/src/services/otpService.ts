import crypto from 'crypto'
import { query } from '../config/db.js'
import logger from '../utils/logger.js'

const OTP_LENGTH = 6
const OTP_TTL_MINUTES = 10
const MAX_ATTEMPTS = 5

function generateOtp(): string {
  return crypto.randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, '0')
}

function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex')
}

export interface OtpRecord {
  id: string
  order_id: string
  phone: string
  otp_hash: string
  expires_at: Date
  attempts: number
  used: boolean
  created_at: Date
}

export async function createOtp(orderId: string, phone: string): Promise<string> {
  await query(
    `DELETE FROM delivery_otps WHERE order_id = $1`,
    [orderId]
  )

  const otp = generateOtp()
  const hash = hashOtp(otp)
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000)

  await query(
    `INSERT INTO delivery_otps (order_id, phone, otp_hash, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [orderId, phone, hash, expiresAt]
  )

  logger.info(`[otpService] OTP created for order ${orderId}`)
  return otp
}

export type VerifyResult =
  | { success: true }
  | { success: false; reason: 'not_found' | 'expired' | 'used' | 'invalid' | 'max_attempts' }

export async function verifyOtp(orderId: string, otp: string): Promise<VerifyResult> {
  const result = await query<OtpRecord>(
    `SELECT * FROM delivery_otps WHERE order_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [orderId]
  )

  if (result.rowCount === 0) {
    return { success: false, reason: 'not_found' }
  }

  const record = result.rows[0]

  if (record.used) {
    return { success: false, reason: 'used' }
  }

  if (new Date() > new Date(record.expires_at)) {
    return { success: false, reason: 'expired' }
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    return { success: false, reason: 'max_attempts' }
  }

  await query(
    `UPDATE delivery_otps SET attempts = attempts + 1 WHERE id = $1`,
    [record.id]
  )

  const inputHash = hashOtp(otp)
  if (inputHash !== record.otp_hash) {
    logger.warn(`[otpService] Invalid OTP attempt for order ${orderId} (attempt ${record.attempts + 1})`)
    return { success: false, reason: 'invalid' }
  }

  await query(
    `UPDATE delivery_otps SET used = TRUE WHERE id = $1`,
    [record.id]
  )

  logger.info(`[otpService] OTP verified successfully for order ${orderId}`)
  return { success: true }
}

export async function cleanupExpiredOtps(): Promise<void> {
  const result = await query(
    `DELETE FROM delivery_otps WHERE expires_at < NOW() AND used = FALSE`
  )
  if ((result.rowCount ?? 0) > 0) {
    logger.info(`[otpService] Cleaned up ${result.rowCount} expired OTPs`)
  }
}
