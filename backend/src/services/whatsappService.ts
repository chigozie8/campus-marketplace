import axios from 'axios'
import crypto from 'crypto'
import logger from '../utils/logger.js'

const YCLOUD_BASE = 'https://api.ycloud.com/v2'

// ─── Send a plain text message via YCloud ────────────────────────────────────
export async function sendMessage(to: string, text: string): Promise<void> {
  const apiKey = process.env.YCLOUD_API_KEY
  const from   = process.env.YCLOUD_PHONE_NUMBER

  if (!apiKey || !from) {
    logger.warn('[WhatsApp] YCLOUD_API_KEY or YCLOUD_PHONE_NUMBER not set — message skipped.')
    return
  }

  try {
    await axios.post(
      `${YCLOUD_BASE}/whatsapp/messages`,
      {
        from,
        to,
        type: 'text',
        text: { body: text },
      },
      {
        headers: {
          'X-API-Key':     apiKey,
          'Content-Type':  'application/json',
        },
      },
    )
    logger.info(`[WhatsApp] Message sent to ${to}`)
  } catch (err: any) {
    logger.error(`[WhatsApp] Failed to send to ${to}: ${err?.response?.data?.message ?? err.message}`)
    throw err
  }
}

// ─── Send a WhatsApp template message ────────────────────────────────────────
export async function sendTemplate(
  to: string,
  templateName: string,
  languageCode = 'en',
  components: object[] = [],
): Promise<void> {
  const apiKey = process.env.YCLOUD_API_KEY
  const from   = process.env.YCLOUD_PHONE_NUMBER

  if (!apiKey || !from) {
    logger.warn('[WhatsApp] YCLOUD_API_KEY or YCLOUD_PHONE_NUMBER not set — template skipped.')
    return
  }

  try {
    await axios.post(
      `${YCLOUD_BASE}/whatsapp/messages`,
      {
        from,
        to,
        type: 'template',
        template: {
          name:     templateName,
          language: { code: languageCode },
          components,
        },
      },
      {
        headers: {
          'X-API-Key':    apiKey,
          'Content-Type': 'application/json',
        },
      },
    )
    logger.info(`[WhatsApp] Template "${templateName}" sent to ${to}`)
  } catch (err: any) {
    logger.error(`[WhatsApp] Template failed for ${to}: ${err?.response?.data?.message ?? err.message}`)
    throw err
  }
}

// ─── Verify YCloud webhook signature ─────────────────────────────────────────
// YCloud sends: X-YCloud-Signature-256: sha256=<HMAC-SHA256(rawBody, secret)>
export function verifyYCloudSignature(rawBody: Buffer, signature: string): boolean {
  const secret = process.env.YCLOUD_WEBHOOK_SECRET
  if (!secret) return true // skip verification if secret not configured

  const expected = `sha256=${crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')}`

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}
