import axios from 'axios'
import { supabaseAdmin } from '../config/supabaseClient.js'
import logger from '../utils/logger.js'

const WASENDER_BASE = 'https://wasenderapi.com/api'

interface WasenderCreds {
  apiKey: string
}

async function getCredentials(): Promise<WasenderCreds | null> {
  const apiKey = process.env.WASENDER_API_KEY
  if (apiKey) return { apiKey }

  try {
    const { data } = await supabaseAdmin
      .from('site_settings')
      .select('key, value')
      .in('key', ['integration_wasender_api_key'])

    if (!data?.length) return null

    const map = Object.fromEntries(data.map((r: { key: string; value: string }) => [r.key, r.value]))
    const dbKey = map['integration_wasender_api_key']

    if (dbKey) return { apiKey: dbKey }
  } catch (err) {
    logger.warn('[WhatsApp] Could not load WaSender credentials from DB:', err)
  }

  return null
}

function normalizePhone(to: string): string {
  const cleaned = to.replace(/[^\d+]/g, '')
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`
}

export async function sendMessage(to: string, text: string): Promise<void> {
  const creds = await getCredentials()
  if (!creds) {
    logger.warn('[WhatsApp] WaSender credentials not configured — message skipped.')
    return
  }

  const recipient = normalizePhone(to)

  try {
    await axios.post(
      `${WASENDER_BASE}/send-message`,
      { to: recipient, text },
      {
        headers: {
          Authorization: `Bearer ${creds.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      },
    )
    logger.info(`[WhatsApp] Message sent to ${recipient}`)
  } catch (err: any) {
    const detail = err?.response?.data ?? err.message
    logger.error(`[WhatsApp] Failed to send to ${recipient}:`, detail)
    throw err
  }
}

export async function sendImage(to: string, imageUrl: string, caption?: string): Promise<void> {
  const creds = await getCredentials()
  if (!creds) return
  const recipient = normalizePhone(to)
  try {
    await axios.post(
      `${WASENDER_BASE}/send-image`,
      { to: recipient, imageUrl, text: caption ?? '' },
      {
        headers: {
          Authorization: `Bearer ${creds.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      },
    )
  } catch (err: any) {
    logger.error(`[WhatsApp] Failed to send image to ${recipient}:`, err?.response?.data ?? err.message)
  }
}

export async function sendTemplate(
  to: string,
  _templateId: string,
  params: string[] = [],
): Promise<void> {
  const text = params.length ? params.join(' ') : 'Hello from VendoorX'
  await sendMessage(to, text)
}
