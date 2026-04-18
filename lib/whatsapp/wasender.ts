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
 */

import {
  isOptedOut,
  tryConsumeUserQuota,
  tryConsumeGlobalQuota,
  isDuplicateRecent,
  isValidPhone,
} from './consent'

const WASENDER_BASE = 'https://wasenderapi.com/api'

interface SendOptions {
  /** Skip the human-like random delay (use sparingly, eg health pings). */
  immediate?: boolean
  /** Skip rate / dedup / opt-out checks. ONLY for system-critical alerts. */
  bypassSafety?: boolean
}

interface SendResult {
  ok: boolean
  reason?: 'no-credentials' | 'invalid-phone' | 'opted-out' | 'rate-limit' | 'global-cap' | 'duplicate' | 'api-error'
}

function jitter(): number {
  // 800–2400 ms — slow enough to look human, fast enough to feel responsive
  return 800 + Math.floor(Math.random() * 1600)
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

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
  if (!apiKey)              return { ok: false, reason: 'no-credentials' }
  if (!isValidPhone(to))    return { ok: false, reason: 'invalid-phone' }

  const recipient = normalize(to)

  // ── Safety gates (skippable only for urgent system messages) ──
  if (!opts.bypassSafety) {
    if (await isOptedOut(recipient))           return { ok: false, reason: 'opted-out' }
    if (await isDuplicateRecent(recipient, text)) return { ok: false, reason: 'duplicate' }
    if (!(await tryConsumeGlobalQuota()))      return { ok: false, reason: 'global-cap' }
    if (!(await tryConsumeUserQuota(recipient))) return { ok: false, reason: 'rate-limit' }
  }

  if (!opts.immediate) await sleep(jitter())

  try {
    const res = await fetch(`${WASENDER_BASE}/send-message`, {
      method:  'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to: recipient, text }),
    })
    if (!res.ok) return { ok: false, reason: 'api-error' }
    return { ok: true }
  } catch {
    return { ok: false, reason: 'api-error' }
  }
}
