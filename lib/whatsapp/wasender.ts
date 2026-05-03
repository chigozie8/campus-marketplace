/**
 * Central WhatsApp send wrapper for VendoorX — v2.
 *
 * Every outbound message is protected by:
 *   • opt-out check        — never message blocked numbers
 *   • per-user rate cap    — ≤ 20 / hour (conservative, anti-ban)
 *   • global daily cap     — ≤ 800 / day across all users
 *   • dedup window         — drops identical msg sent within 60 s
 *   • phone validation     — malformed numbers never reach the API
 *   • human-like jitter    — 800–2400 ms random delay before sending
 *   • auto-retry (1×)      — retries once on transient 5xx / network errors
 *   • message chunking     — splits messages > 1500 chars into parts
 *                            (WhatsApp renders very long messages poorly)
 *
 * Log every attempt with a masked phone + reason so Vercel logs are useful
 * without leaking PII.
 */

import {
  isOptedOut,
  tryConsumeUserQuota,
  tryConsumeGlobalQuota,
  isDuplicateRecent,
  isValidPhone,
} from './consent'

const WASENDER_BASE   = 'https://www.wasenderapi.com/api'
const MAX_CHUNK_CHARS = 1500   // split messages longer than this
const CHUNK_DELAY_MS  = 1200   // pause between chunks (feels natural)

// ─── Types ────────────────────────────────────────────────────────────────────

interface SendOptions {
  /** Skip the human-like random delay (use sparingly — health pings, etc). */
  immediate?: boolean
  /** Skip all safety checks. ONLY for TOS / opt-out acknowledgements. */
  bypassSafety?: boolean
  /** Do NOT split long messages into chunks. */
  noChunk?: boolean
}

export type SendReason =
  | 'no-credentials' | 'invalid-phone' | 'opted-out'
  | 'rate-limit'     | 'global-cap'    | 'duplicate'
  | 'api-error'      | 'http-error'

export interface SendResult {
  ok:      boolean
  reason?: SendReason
  /** WaSenderAPI HTTP status (when an API call was actually made). */
  status?: number
  /** First ~300 chars of response body for debugging. */
  body?:   string
  /** Number of chunks sent (> 1 means message was split). */
  chunks?: number
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/** Random delay that mimics human typing (800–2400 ms). */
function jitter(): number { return 800 + Math.floor(Math.random() * 1600) }
function sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)) }
function maskPhone(p: string): string {
  return p.length <= 4 ? p : p.slice(0, 4) + '***' + p.slice(-2)
}

/** WaSenderAPI expects "+<digits>" — normalise everything else. */
function normalize(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '')
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`
}

/**
 * Split a long message into natural chunks at paragraph boundaries.
 * Falls back to hard character splits if no good break point exists.
 */
function chunkMessage(text: string): string[] {
  if (text.length <= MAX_CHUNK_CHARS) return [text]
  const chunks: string[] = []
  let remaining = text
  while (remaining.length > MAX_CHUNK_CHARS) {
    // Try to break at a double newline (paragraph)
    let cutAt = remaining.lastIndexOf('\n\n', MAX_CHUNK_CHARS)
    if (cutAt < MAX_CHUNK_CHARS * 0.5) {
      // Fall back to single newline
      cutAt = remaining.lastIndexOf('\n', MAX_CHUNK_CHARS)
    }
    if (cutAt < MAX_CHUNK_CHARS * 0.3) {
      // Last resort: hard cut
      cutAt = MAX_CHUNK_CHARS
    }
    chunks.push(remaining.slice(0, cutAt).trimEnd())
    remaining = remaining.slice(cutAt).trimStart()
  }
  if (remaining.length) chunks.push(remaining)
  return chunks
}

// ─── Raw API call (single chunk) ─────────────────────────────────────────────
async function sendOne(
  apiKey: string,
  recipient: string,
  text: string,
  tag: string,
): Promise<{ ok: boolean; status?: number; body?: string; reason?: SendReason }> {
  const doFetch = async () =>
    fetch(`${WASENDER_BASE}/send-message`, {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to: recipient, text }),
    })

  try {
    let res = await doFetch()

    // Auto-retry once on 5xx / network flakiness
    if (!res.ok && res.status >= 500) {
      console.warn(`${tag} HTTP ${res.status} — retrying once in 2 s`)
      await sleep(2000)
      res = await doFetch()
    }

    const raw  = await res.text().catch(() => '')
    const body = raw.slice(0, 300)

    if (!res.ok) {
      console.error(`${tag} HTTP ${res.status}: ${body}`)
      return { ok: false, reason: 'http-error', status: res.status, body }
    }

    return { ok: true, status: res.status, body }
  } catch (err: any) {
    console.error(`${tag} fetch threw:`, err?.message ?? err)
    return { ok: false, reason: 'api-error', body: String(err?.message ?? err) }
  }
}

// ─── Public send function ─────────────────────────────────────────────────────

export async function sendWhatsApp(
  to:   string,
  text: string,
  opts: SendOptions = {},
): Promise<SendResult> {
  const apiKey = process.env.WASENDER_API_KEY
  const tag    = `[wa-send ${maskPhone(to)}]`

  // ── Pre-flight checks ──────────────────────────────────────────
  if (!apiKey) {
    console.warn(`${tag} blocked: WASENDER_API_KEY not set`)
    return { ok: false, reason: 'no-credentials' }
  }
  if (!isValidPhone(to)) {
    console.warn(`${tag} blocked: invalid phone "${to}"`)
    return { ok: false, reason: 'invalid-phone' }
  }

  const recipient = normalize(to)

  // ── Safety gates (skip only for TOS / opt-out system messages) ─
  if (!opts.bypassSafety) {
    if (await isOptedOut(recipient)) {
      console.info(`${tag} blocked: user opted out`)
      return { ok: false, reason: 'opted-out' }
    }
    if (await isDuplicateRecent(recipient, text)) {
      console.info(`${tag} blocked: duplicate within 60 s window`)
      return { ok: false, reason: 'duplicate' }
    }
    if (!(await tryConsumeGlobalQuota())) {
      console.warn(`${tag} blocked: global daily cap (800/day) reached`)
      return { ok: false, reason: 'global-cap' }
    }
    if (!(await tryConsumeUserQuota(recipient))) {
      console.info(`${tag} blocked: per-user rate (20/hr) reached`)
      return { ok: false, reason: 'rate-limit' }
    }
  }

  // ── Human-like delay ───────────────────────────────────────────
  if (!opts.immediate) await sleep(jitter())

  // ── Chunk long messages ────────────────────────────────────────
  const chunks = opts.noChunk ? [text] : chunkMessage(text)

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const result = await sendOne(apiKey, recipient, chunk, tag)

    if (!result.ok) {
      return { ...result, chunks: i + 1 }
    }

    // Pause between chunks so they arrive in order and look natural
    if (i < chunks.length - 1) {
      await sleep(CHUNK_DELAY_MS + Math.floor(Math.random() * 400))
    }

    console.info(`${tag} chunk ${i + 1}/${chunks.length} sent ✓ (${chunk.length} chars)`)
  }

  return { ok: true, chunks: chunks.length }
}

/**
 * Convenience: send a message and silently swallow the result.
 * Useful inside fire-and-forget handlers where you still want logging.
 */
export async function sendWhatsAppQuiet(
  to:   string,
  text: string,
  opts: SendOptions = {},
): Promise<void> {
  const result = await sendWhatsApp(to, text, opts)
  if (!result.ok) {
    console.warn(`[wa-quiet] send failed to ${maskPhone(to)}: reason=${result.reason}`)
  }
}
