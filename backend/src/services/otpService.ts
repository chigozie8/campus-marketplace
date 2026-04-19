import crypto from 'crypto'
import { supabaseAdmin } from '../config/supabaseClient.js'
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
  channel: OtpChannel
  expires_at: string
  attempts: number
  used: boolean
  created_at: string
}

interface CreateOtpRecordOptions {
  orderId: string
  channel: OtpChannel
  phone?: string
  otpHash?: string
}

export async function createOtpRecord(opts: CreateOtpRecordOptions): Promise<void> {
  // Delete any existing OTP for this order first
  await supabaseAdmin.from('delivery_otps').delete().eq('order_id', opts.orderId)

  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString()

  const { error } = await supabaseAdmin.from('delivery_otps').insert({
    order_id: opts.orderId,
    channel: opts.channel,
    phone: opts.phone ?? null,
    otp_hash: opts.otpHash ?? null,
    expires_at: expiresAt,
  })

  if (error) throw new Error(`[otpService] Failed to create OTP record: ${error.message}`)
  logger.info(`[otpService] OTP record created for order ${opts.orderId} (channel=${opts.channel})`)
}

export function generateRawOtp(): string {
  return generateOtp()
}

export function hashRawOtp(otp: string): string {
  return hashOtp(otp)
}

export async function getOtpRecord(orderId: string): Promise<OtpRecord | null> {
  const { data, error } = await supabaseAdmin
    .from('delivery_otps')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(`[otpService] Failed to get OTP record: ${error.message}`)
  return data as OtpRecord | null
}

export async function markOtpUsed(orderId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('delivery_otps')
    .update({ used: true })
    .eq('order_id', orderId)

  if (error) throw new Error(`[otpService] Failed to mark OTP used: ${error.message}`)
  logger.info(`[otpService] OTP marked used for order ${orderId}`)
}

export async function incrementAttempts(recordId: string): Promise<void> {
  const { data: current } = await supabaseAdmin
    .from('delivery_otps')
    .select('attempts')
    .eq('id', recordId)
    .single()

  await supabaseAdmin
    .from('delivery_otps')
    .update({ attempts: (current?.attempts ?? 0) + 1 })
    .eq('id', recordId)
}

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
  const { count, error } = await supabaseAdmin
    .from('delivery_otps')
    .delete({ count: 'exact' })
    .lt('expires_at', new Date().toISOString())
    .eq('used', false)

  if (error) {
    logger.warn(`[otpService] Cleanup failed: ${error.message}`)
    return
  }
  if ((count ?? 0) > 0) {
    logger.info(`[otpService] Cleaned up ${count} expired OTPs`)
  }
}
