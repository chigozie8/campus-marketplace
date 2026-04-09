import axios from 'axios'
import logger from '../utils/logger.js'

const BASE_URL = 'https://graph.facebook.com/v19.0'

// ─── Send a plain text message ────────────────────────────────────────────────
export async function sendMessage(to: string, text: string): Promise<void> {
  const token         = process.env.WHATSAPP_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!token || !phoneNumberId) {
    logger.warn('[WhatsApp] WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID not set — message skipped.')
    return
  }

  try {
    await axios.post(
      `${BASE_URL}/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text },
      },
      {
        headers: {
          Authorization:  `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    )
    logger.info(`[WhatsApp] Message sent to ${to}`)
  } catch (err: any) {
    logger.error(`[WhatsApp] Failed to send to ${to}: ${err?.response?.data?.error?.message ?? err.message}`)
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
  const token         = process.env.WHATSAPP_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!token || !phoneNumberId) {
    logger.warn('[WhatsApp] Credentials not set — template skipped.')
    return
  }

  try {
    await axios.post(
      `${BASE_URL}/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
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
          Authorization:  `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    )
    logger.info(`[WhatsApp] Template "${templateName}" sent to ${to}`)
  } catch (err: any) {
    logger.error(`[WhatsApp] Template failed for ${to}: ${err?.response?.data?.error?.message ?? err.message}`)
    throw err
  }
}
