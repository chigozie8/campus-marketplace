import { Client, Account } from 'node-appwrite'
import logger from '../utils/logger.js'

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT ?? 'https://sfo.cloud.appwrite.io/v1'
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID ?? '69d0104f0024b77cfd50'
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY ?? ''

function createAdminClient() {
  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY)
  return new Account(client)
}

/**
 * Send a delivery OTP email via Appwrite Email Token.
 * Uses the buyer's order ID as a deterministic Appwrite userId so
 * each order gets its own isolated token slot (no cross-order conflicts).
 */
export async function sendDeliveryOtpEmail(
  appwriteUserId: string,
  email: string,
  orderId: string,
): Promise<boolean> {
  if (!APPWRITE_API_KEY) {
    logger.warn('[appwriteEmail] APPWRITE_API_KEY not set — dev mode, skipping email send')
    logger.info(`[appwriteEmail] [DEV] Would send OTP to ${email} for order ${orderId}`)
    return true
  }

  try {
    const account = createAdminClient()
    await account.createEmailToken(appwriteUserId, email)
    logger.info(`[appwriteEmail] OTP email sent to ${email} for order ${orderId} (userId=${appwriteUserId})`)
    return true
  } catch (err: unknown) {
    const e = err as { code?: number; message?: string }
    logger.error(`[appwriteEmail] Failed to send OTP email: ${e?.message ?? err}`)
    return false
  }
}

/**
 * Verify a delivery OTP against Appwrite.
 * Calls createSession(userId, otp) — if it succeeds the code is valid.
 * The session is immediately discarded (we only need the validity proof).
 */
export async function verifyDeliveryOtpEmail(
  appwriteUserId: string,
  otp: string,
): Promise<{ success: boolean; reason?: string }> {
  try {
    const client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID)
    const account = new Account(client)
    await account.createSession(appwriteUserId, otp.trim())
    logger.info(`[appwriteEmail] OTP verified OK for userId=${appwriteUserId}`)
    return { success: true }
  } catch (err: unknown) {
    const e = err as { code?: number; message?: string; type?: string }
    logger.warn(`[appwriteEmail] OTP verify failed: ${e?.message}`)

    if (e?.type === 'user_invalid_token' || e?.code === 401) {
      return { success: false, reason: 'invalid' }
    }
    if (e?.type === 'user_session_already_exists') {
      return { success: false, reason: 'used' }
    }
    return { success: false, reason: 'error' }
  }
}
