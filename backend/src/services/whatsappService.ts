import axios from 'axios'
import logger from '../utils/logger.js'

const GUPSHUP_BASE = 'https://api.gupshup.io/wa/api/v1'

// ─── Send a plain text message via Gupshup ───────────────────────────────────
export async function sendMessage(to: string, text: string): Promise<void> {
  const apiKey  = process.env.GUPSHUP_API_KEY
  const appName = process.env.GUPSHUP_APP_NAME
  const from    = process.env.GUPSHUP_PHONE_NUMBER

  if (!apiKey || !appName || !from) {
    logger.warn('[WhatsApp] Gupshup credentials not configured — message skipped.')
    return
  }

  // Gupshup requires E.164 without the + sign (e.g. 2348012345678)
  const cleanTo = to.replace(/^\+/, '')

  try {
    await axios.post(
      `${GUPSHUP_BASE}/msg`,
      new URLSearchParams({
        channel:     'whatsapp',
        source:      from,
        destination: cleanTo,
        message:     JSON.stringify({ isHSM: 'false', type: 'text', text: { body: text } }),
        'src.name':  appName,
      }),
      {
        headers: {
          apikey:         apiKey,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    )
    logger.info(`[WhatsApp] Message sent to ${cleanTo}`)
  } catch (err: any) {
    logger.error(`[WhatsApp] Failed to send to ${cleanTo}: ${err?.response?.data?.message ?? err.message}`)
    throw err
  }
}

// ─── Send a Gupshup template (HSM) message ───────────────────────────────────
export async function sendTemplate(
  to: string,
  templateId: string,
  params: string[] = [],
): Promise<void> {
  const apiKey  = process.env.GUPSHUP_API_KEY
  const appName = process.env.GUPSHUP_APP_NAME
  const from    = process.env.GUPSHUP_PHONE_NUMBER

  if (!apiKey || !appName || !from) {
    logger.warn('[WhatsApp] Gupshup credentials not configured — template skipped.')
    return
  }

  const cleanTo = to.replace(/^\+/, '')

  try {
    await axios.post(
      `${GUPSHUP_BASE}/template/msg`,
      new URLSearchParams({
        channel:     'whatsapp',
        source:      from,
        destination: cleanTo,
        template:    JSON.stringify({ id: templateId, params }),
        'src.name':  appName,
      }),
      {
        headers: {
          apikey:         apiKey,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    )
    logger.info(`[WhatsApp] Template "${templateId}" sent to ${cleanTo}`)
  } catch (err: any) {
    logger.error(`[WhatsApp] Template failed for ${cleanTo}: ${err?.response?.data?.message ?? err.message}`)
    throw err
  }
}
