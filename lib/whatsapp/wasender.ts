/**
 * Central WhatsApp send wrapper for VendoorX.
 *
 * Use this instead of calling WaSenderAPI directly so every
 * outbound message is protected by:
 *   • opt-out check       (never message blocked numbers)
 *   • per-user rate cap   (≤ 30 / hour)
 *   • global daily cap    (≤ 1000 / day across the bot)
 *   • dedup window        (drop identical msg within 30 s)
 *   • randomised delay    (looks human, ≈ 800-2400 ms)
 *
 * Logs every outbound attempt with the reason if it was blocked or failed
 * so production issues are visible in Vercel function logs.
 */

import {
  isOptedOut,
  tryConsumeUserQuota,
  tryConsumeGlobalQuota,
  isDuplicateRecent,
  isValidPhone,
} from './consent'

const WASENDER_BASE = 'https://www.wasenderapi.com/api'

interface SendOptions {
  /** Skip the human-like random delay (use sparingly, eg health pings). */
  immediate?: boolean
  /** Skip rate / dedup / opt-out checks. ONLY for system-critical alerts. */
  bypassSafety?: boolean
}

export type SendReason =
  | 'no-credentials' | 'invalid-phone' | 'opted-out'
  | 'rate-limit' | 'global-cap' | 'duplicate'
  | 'api-error' | 'http-error'

interface SendResult {
  ok: boolean
  reason?: SendReason
  /** WaSender's HTTP status (when an API call was actually made). */
  status?: number
  /** First ~200 chars of WaSender's response body for debugging. */
  body?: string
}

function jitter(): number { return 800 + Math.floor(Math.random() * 1600) }
function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }
function maskPhone(p: string): string { return p.length <= 4 ? p : p.slice(0, 4) + '***' + p.slice(-2) }

/** WaSender expects "+<digits>" — strip everything else and re-prefix. */
function normalize(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '')
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`
}

export async function sendWhatsApp(
  to: string,
  text: string,
  opts: SendOptions = {},
): Promise<SendResult> {
  const apiKey = process.env.WASENDER_API_KEY
  const tag    = `[wa-send ${maskPhone(to)}]`

  if (!apiKey) {
    console.warn(`${tag} blocked: WASENDER_API_KEY not set`)
    return { ok: false, reason: 'no-credentials' }
  }
  if (!isValidPhone(to)) {
    console.warn(`${tag} blocked: invalid phone format`)
    return { ok: false, reason: 'invalid-phone' }
  }

  const recipient = normalize(to)

  // ── Safety gates (skippable only for urgent system messages) ──
  if (!opts.bypassSafety) {
    if (await isOptedOut(recipient)) {
      console.info(`${tag} blocked: user opted out`)
      return { ok: false, reason: 'opted-out' }
    }
    if (await isDuplicateRecent(recipient, text)) {
      console.info(`${tag} blocked: duplicate message in 30s window`)
      return { ok: false, reason: 'duplicate' }
    }
    if (!(await tryConsumeGlobalQuota())) {
      console.warn(`${tag} blocked: global daily cap (1000/day) reached`)
      return { ok: false, reason: 'global-cap' }
    }
    if (!(await tryConsumeUserQuota(recipient))) {
      console.info(`${tag} blocked: per-user rate (30/hr) reached`)
      return { ok: false, reason: 'rate-limit' }
    }
  }

  if (!opts.immediate) await sleep(jitter())

  try {
    const res  = await fetch(`${WASENDER_BASE}/send-message`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ to: recipient, text }),
    })
    const raw  = await res.text().catch(() => '')
    const body = raw.slice(0, 200)

    if (!res.ok) {
      console.error(`${tag} HTTP ${res.status}: ${body}`)
      return { ok: false, reason: 'http-error', status: res.status, body }
    }
    console.info(`${tag} sent ✓ (${text.length} chars)`)
    return { ok: true, status: res.status, body }
  } catch (err: any) {
    console.error(`${tag} fetch threw:`, err?.message ?? err)
    return { ok: false, reason: 'api-error', body: String(err?.message ?? err) }
  }
}
