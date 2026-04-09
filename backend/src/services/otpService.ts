import crypto from 'crypto'
import { query } from '../config/db.js'
import logger from '../utils/logger.js'

const OTP_LENGTH = 6
const OTP_TTL_MINUTES = 10
const MAX_ATTEMPTS = 5

export type OtpChannel = 'email' | 'sms' | 'both'

function generateOtp(): string {
  return crypto.randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, '0')
}

function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex')
}

export interface OtpRecord {
  id: string
  order_id: string
  phone: string | null
  otp_hash: string | null
  appwrite_user_id: string | null
  channel: OtpChannel
  expires_at: Date
  attempts: number
  used: boolean
  created_at: Date
}

// ---------------------------------------------------------------------------
// Unified record creator — used by all channels
// ---------------------------------------------------------------------------

interface CreateOtpRecordOptions {
  orderId: string
  channel: OtpChannel
  /** Populated for sms and both channels */
  phone?: string
  /** Populated for sms and both channels */
  otpHash?: string
  /** Populated for email and both channels */
  appwriteUserId?: string
}

export async function createOtpRecord(opts: CreateOtpRecordOptions): Promise<void> {
  await query(`DELETE FROM delivery_otps WHERE order_id = $1`, [opts.orderId])

  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000)

  await query(
    `INSERT INTO delivery_otps
       (order_id, channel, phone, otp_hash, appwrite_user_id, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      opts.orderId,
      opts.channel,
      opts.phone ?? null,
      opts.otpHash ?? null,
      opts.appwriteUserId ?? null,
      expiresAt,
    ],
  )

  logger.info(`[otpService] OTP record created for order ${opts.orderId} (channel=${opts.channel})`)
}

/** Raw code generation — exposed so routes can use the same code for both SMS + email in 'both' mode */
export function generateRawOtp(): string {
  return generateOtp()
}

export function hashRawOtp(otp: string): string {
  return hashOtp(otp)
}

// ---------------------------------------------------------------------------
// Record retrieval and lifecycle
// ---------------------------------------------------------------------------

export async function getOtpRecord(orderId: string): Promise<OtpRecord | null> {
  const result = await query<OtpRecord>(
    `SELECT * FROM delivery_otps WHERE order_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [orderId],
  )
  return result.rowCount === 0 ? null : result.rows[0]
}

export async function markOtpUsed(orderId: string): Promise<void> {
  await query(`UPDATE delivery_otps SET used = TRUE WHERE order_id = $1`, [orderId])
  logger.info(`[otpService] OTP marked used for order ${orderId}`)
}

export async function incrementAttempts(recordId: string): Promise<void> {
  await query(`UPDATE delivery_otps SET attempts = attempts + 1 WHERE id = $1`, [recordId])
}

// ---------------------------------------------------------------------------
// Hash-based verification (SMS / both channels)
// ---------------------------------------------------------------------------

export type VerifyResult =
  | { success: true }
  | { success: false; reason: 'not_found' | 'expired' | 'used' | 'invalid' | 'max_attempts' }

export async function verifyHashOtp(record: OtpRecord, otp: string): Promise<VerifyResult> {
  if (!record.otp_hash) return { success: false, reason: 'not_found' }
  if (record.used) return { success: false, reason: 'used' }
  if (new Date() > new Date(record.expires_at)) return { success: false, reason: 'expired' }
  if (record.attempts >= MAX_ATTEMPTS) return { success: false, reason: 'max_attempts' }

  await incrementAttempts(record.id)

  if (hashOtp(otp.trim()) !== record.otp_hash) {
    logger.warn(`[otpService] Invalid OTP attempt for order ${record.order_id} (attempt ${record.attempts + 1})`)
    return { success: false, reason: 'invalid' }
  }

  return { success: true }
}

// ---------------------------------------------------------------------------
// Legacy Termii-only helpers (kept for backward compatibility)
// ---------------------------------------------------------------------------

export async function createOtp(orderId: string, phone: string): Promise<string> {
  const otp = generateOtp()
  await createOtpRecord({
    orderId,
    channel: 'sms',
    phone,
    otpHash: hashOtp(otp),
  })
  return otp
}

export async function verifyOtp(orderId: string, otp: string): Promise<VerifyResult> {
  const record = await getOtpRecord(orderId)
  if (!record) return { success: false, reason: 'not_found' }
  const result = await verifyHashOtp(record, otp)
  if (result.success) await markOtpUsed(orderId)
  return result
}

export async function cleanupExpiredOtps(): Promise<void> {
  const result = await query(
    `DELETE FROM delivery_otps WHERE expires_at < NOW() AND used = FALSE`,
  )
  if ((result.rowCount ?? 0) > 0) {
    logger.info(`[otpService] Cleaned up ${result.rowCount} expired OTPs`)
  }
}
