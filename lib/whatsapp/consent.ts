/**
 * WhatsApp consent + anti-ban safety layer — VendoorX v2.
 *
 * WhatsApp / WasenderAPI ban-avoidance rules enforced here:
 *
 *  1. Inbound-only  — we ONLY ever reply to messages the user sent first.
 *                     We never initiate contact (no cold outreach whatsoever).
 *  2. TOS opt-in    — every new contact must reply YES before the bot responds.
 *  3. STOP honoured — any opt-out keyword → consent = opted_out → never message again.
 *  4. Per-user cap  — ≤ 20 bot replies per recipient per hour (conservative).
 *  5. Global cap    — ≤ 800 bot replies per day across all users (safety buffer).
 *  6. Dedup window  — exact same reply within 60 s is dropped (prevents double-sends).
 *  7. Jitter delay  — random 800–2400 ms before sending (mimics human typing speed).
 *  8. Consent TTL   — accepted consent persists for 2 years (GDPR-friendly).
 *  9. Pending TTL   — pending TOS expires after 7 days if no response, resets cleanly.
 * 10. Block tracking — counts how many times a user was rate-blocked (admin visibility).
 */

import { rGet, rSet, rIncr, rDel } from './redis'

const ONE_MINUTE = 60
const ONE_HOUR   = 60 * 60
const ONE_DAY    = 24 * 60 * 60
const SEVEN_DAYS = 7  * 24 * 60 * 60
const TWO_YEARS  = 2  * 365 * 24 * 60 * 60

export type ConsentState = 'none' | 'pending' | 'accepted' | 'opted_out'

/** Keep phone digits only for Redis keys — avoids PII leaking into log paths. */
const PHONE_RE = /^\+?\d{7,15}$/
function key(phone: string, suffix: string) {
  const clean = phone.replace(/[^\d]/g, '')
  return `wa:${suffix}:${clean}`
}

// ─── Consent state ────────────────────────────────────────────────────────────

export async function getConsent(phone: string): Promise<ConsentState> {
  const v = await rGet(key(phone, 'consent'))
  if (v === 'accepted' || v === 'pending' || v === 'opted_out') return v
  return 'none'
}

export async function setConsent(phone: string, state: ConsentState): Promise<void> {
  const ttl = state === 'pending'    ? SEVEN_DAYS  // auto-expire stale pending consent
            : state === 'opted_out'  ? TWO_YEARS   // remember opt-out for a long time
            :                          TWO_YEARS   // accepted / none
  await rSet(key(phone, 'consent'), state, ttl)
}

export async function isOptedOut(phone: string): Promise<boolean> {
  return (await getConsent(phone)) === 'opted_out'
}

// ─── Per-recipient rate limit ─────────────────────────────────────────────────
// Conservative: 20 bot replies per user per hour.
// Lower than the old 30 — WasenderAPI accounts are sensitive to burst behaviour.
const PER_USER_LIMIT = 20

export async function tryConsumeUserQuota(phone: string): Promise<boolean> {
  const n = await rIncr(key(phone, 'rate'), ONE_HOUR)
  if (n > PER_USER_LIMIT) {
    // Track how many times this user was blocked (admin visibility)
    await rIncr(key(phone, 'rate_blocked'), ONE_DAY)
    return false
  }
  return true
}

/** How many times a user has been rate-blocked today */
export async function getUserBlockCount(phone: string): Promise<number> {
  const v = await rGet(key(phone, 'rate_blocked'))
  return Number(v ?? 0)
}

// ─── Global daily cap ─────────────────────────────────────────────────────────
// 800 instead of 1000 — keeps headroom below typical WasenderAPI plan limits.
const GLOBAL_DAILY_LIMIT = 800

export async function tryConsumeGlobalQuota(): Promise<boolean> {
  const n = await rIncr('wa:rate:global:day', ONE_DAY)
  return n <= GLOBAL_DAILY_LIMIT
}

export async function getGlobalDailyCount(): Promise<number> {
  const v = await rGet('wa:rate:global:day')
  return Number(v ?? 0)
}

// ─── Dedup window ─────────────────────────────────────────────────────────────
// Drop if the exact same message was sent to this user within the last 60 seconds.
// Prevents double-sends on network retries or webhook duplicates.
export async function isDuplicateRecent(phone: string, body: string): Promise<boolean> {
  // DJB2 hash — keeps Redis keys short
  let h = 5381
  for (let i = 0; i < Math.min(body.length, 500); i++) {
    h = ((h << 5) + h + body.charCodeAt(i)) & 0xffffffff
  }
  const k = key(phone, `dedup:${h.toString(36)}`)
  const exists = await rGet(k)
  if (exists) return true
  await rSet(k, '1', 60) // 60 s window
  return false
}

// ─── Webhook idempotency ──────────────────────────────────────────────────────
// Prevent processing the same incoming message twice (WasenderAPI sometimes retries).
export async function isAlreadyProcessed(messageId: string): Promise<boolean> {
  const k = `wa:msgid:${messageId}`
  const exists = await rGet(k)
  if (exists) return true
  await rSet(k, '1', ONE_HOUR) // dedupe window: 1 hour
  return false
}

// ─── Phone validation ─────────────────────────────────────────────────────────
export function isValidPhone(phone: string): boolean {
  if (!phone) return false
  const cleaned = phone.replace(/[^\d+]/g, '')
  return PHONE_RE.test(cleaned)
}

// ─── TOS reminder cooldown ────────────────────────────────────────────────────
// Don't re-send the TOS prompt more than once per minute per user.
// Prevents the bot feeling spammy to users who take time to read the terms.
const TOS_REMINDER_COOLDOWN = 60 // seconds

export async function canSendTosReminder(phone: string): Promise<boolean> {
  const k = key(phone, 'tos_reminder')
  const exists = await rGet(k)
  if (exists) return false
  await rSet(k, '1', TOS_REMINDER_COOLDOWN)
  return true
}

// ─── Admin / test helpers ─────────────────────────────────────────────────────

/** Full consent reset for a user (admin / testing only). */
export async function resetConsent(phone: string): Promise<void> {
  await Promise.all([
    rDel(key(phone, 'consent')),
    rDel(key(phone, 'rate')),
    rDel(key(phone, 'rate_blocked')),
  ])
}

// ─── Session status (set by webhook, read by admin dashboard) ─────────────────

export async function setSessionStatus(status: string): Promise<void> {
  await rSet('wa:session:status',    status,            ONE_DAY)
  await rSet('wa:session:status_at', String(Date.now()), ONE_DAY)
}

export async function getSessionStatus(): Promise<{ status: string; at: number | null }> {
  const status = (await rGet('wa:session:status')) ?? 'unknown'
  const atRaw  =  await rGet('wa:session:status_at')
  return { status, at: atRaw ? Number(atRaw) : null }
}

// ─── Activity tracking (used by admin dashboard) ──────────────────────────────

/** Record that a message was received from this phone (last-seen tracking). */
export async function recordActivity(phone: string): Promise<void> {
  await rSet(key(phone, 'last_seen'), String(Date.now()), SEVEN_DAYS)
}

export async function getLastSeen(phone: string): Promise<number | null> {
  const v = await rGet(key(phone, 'last_seen'))
  return v ? Number(v) : null
}

/** Increment global incoming message counter (for analytics). */
export async function incrementInboundCount(): Promise<void> {
  await rIncr('wa:stats:inbound:day', ONE_DAY)
  await rIncr('wa:stats:inbound:total')
}

export async function getInboundStats(): Promise<{ today: number; total: number }> {
  const [today, total] = await Promise.all([
    rGet('wa:stats:inbound:day').then(v => Number(v ?? 0)),
    rGet('wa:stats:inbound:total').then(v => Number(v ?? 0)),
  ])
  return { today, total }
}
