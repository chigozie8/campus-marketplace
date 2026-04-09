import axios from 'axios'
import { supabaseAdmin } from '../config/supabaseClient.js'
import logger from '../utils/logger.js'

const GUPSHUP_BASE = 'https://api.gupshup.io/wa/api/v1'

// ─── Load credentials: env vars first, then DB fallback ──────────────────────
async function getCredentials(): Promise<{ apiKey: string; appName: string; from: string } | null> {
  const apiKey  = process.env.GUPSHUP_API_KEY
  const appName = process.env.GUPSHUP_APP_NAME
  const from    = process.env.GUPSHUP_PHONE_NUMBER

  if (apiKey && appName && from) return { apiKey, appName, from }

  // Fallback: read from site_settings table (set via admin settings UI)
  try {
    const { data } = await supabaseAdmin
      .from('site_settings')
      .select('key, value')
      .in('key', ['integration_gupshup_api_key', 'integration_gupshup_app_name', 'integration_gupshup_phone_number'])

    if (!data?.length) return null

    const map = Object.fromEntries(data.map((r: { key: string; value: string }) => [r.key, r.value]))
    const dbKey    = map['integration_gupshup_api_key']
    const dbApp    = map['integration_gupshup_app_name']
    const dbPhone  = map['integration_gupshup_phone_number']

    if (dbKey && dbApp && dbPhone) return { apiKey: dbKey, appName: dbApp, from: dbPhone }
  } catch (err) {
    logger.warn('[WhatsApp] Could not load credentials from DB:', err)
  }

  return null
}

// ─── Send a plain text message via Gupshup ───────────────────────────────────
export async function sendMessage(to: string, text: string): Promise<void> {
  const creds = await getCredentials()
  const { apiKey, appName, from } = creds ?? {}

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
  const creds = await getCredentials()
  const { apiKey, appName, from } = creds ?? {}

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
