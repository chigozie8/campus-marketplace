/**
 * WhatsApp consent + anti-ban helpers.
 *
 * To stay compliant with WhatsApp policies (and avoid bans on
 * unofficial APIs like WaSenderAPI), VendoorX:
 *
 *  1. Only replies to users who messaged FIRST  (no cold outreach)
 *  2. Asks every new contact to accept Terms of Service  (opt-in)
 *  3. Honours STOP / UNSUBSCRIBE  → never message them again
 *  4. Rate-limits to ≤ 30 messages per recipient per hour
 *  5. Caps total bot replies at 1000 / day across all users
 *  6. De-duplicates: same text within 30 s → second send is dropped
 *  7. Adds a small randomised delay before each reply (looks human)
 */

import { rGet, rSet, rIncr, rDel } from './redis'

const ONE_HOUR  = 60 * 60
const ONE_DAY   = 24 * 60 * 60
const ONE_YEAR  = 365 * 24 * 60 * 60

export type ConsentState = 'none' | 'pending' | 'accepted' | 'opted_out'

const PHONE_RE = /^\+?\d{7,15}$/
function key(phone: string, suffix: string) {
  const clean = phone.replace(/[^\d]/g, '')
  return `wa:${suffix}:${clean}`
}

// ─── Consent state ──────────────────────────────────────────────
export async function getConsent(phone: string): Promise<ConsentState> {
  const v = await rGet(key(phone, 'consent'))
  if (v === 'accepted' || v === 'pending' || v === 'opted_out') return v
  return 'none'
}

export async function setConsent(phone: string, state: ConsentState): Promise<void> {
  await rSet(key(phone, 'consent'), state, ONE_YEAR)
}

export async function isOptedOut(phone: string): Promise<boolean> {
  return (await getConsent(phone)) === 'opted_out'
}

// ─── Per-recipient rate limit (≤ 30 msgs / hour) ─────────────────
const PER_USER_LIMIT = 30
export async function tryConsumeUserQuota(phone: string): Promise<boolean> {
  const n = await rIncr(key(phone, 'rate'), ONE_HOUR)
  return n <= PER_USER_LIMIT
}

// ─── Global daily cap (≤ 1000 bot replies / day) ─────────────────
const GLOBAL_DAILY_LIMIT = 1000
export async function tryConsumeGlobalQuota(): Promise<boolean> {
  const n = await rIncr('wa:rate:global:day', ONE_DAY)
  return n <= GLOBAL_DAILY_LIMIT
}

// ─── Dedup: ignore if exact same reply was sent < 30 s ago ───────
export async function isDuplicateRecent(phone: string, body: string): Promise<boolean> {
  // Fast hash (DJB2) — Redis keys must be short
  let h = 5381
  for (let i = 0; i < body.length; i++) h = ((h << 5) + h + body.charCodeAt(i)) & 0xffffffff
  const k = key(phone, `dedup:${h.toString(36)}`)
  const exists = await rGet(k)
  if (exists) return true
  await rSet(k, '1', 30)
  return false
}

// ─── Validation ─────────────────────────────────────────────────
export function isValidPhone(phone: string): boolean {
  if (!phone) return false
  const cleaned = phone.replace(/[^\d+]/g, '')
  return PHONE_RE.test(cleaned)
}

// ─── Reset helpers (for admin / testing) ─────────────────────────
export async function resetConsent(phone: string): Promise<void> {
  await rDel(key(phone, 'consent'))
  await rDel(key(phone, 'rate'))
}

// ─── Session status (set by webhook, read by admin dashboard) ────
export async function setSessionStatus(status: string): Promise<void> {
  await rSet('wa:session:status', status, ONE_DAY)
  await rSet('wa:session:status_at', String(Date.now()), ONE_DAY)
}

export async function getSessionStatus(): Promise<{ status: string; at: number | null }> {
  const status = (await rGet('wa:session:status')) ?? 'unknown'
  const atRaw  = await rGet('wa:session:status_at')
  return { status, at: atRaw ? Number(atRaw) : null }
}
