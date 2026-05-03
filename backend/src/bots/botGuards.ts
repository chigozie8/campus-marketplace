/**
 * botGuards.ts
 *
 * Two lightweight guards for the WhatsApp bot:
 *
 *  1. isRateLimited  — sliding-window rate limiter per phone number.
 *                      Allows up to MAX_MESSAGES_PER_WINDOW messages in
 *                      WINDOW_SECONDS. Uses Upstash REST; falls back to an
 *                      in-process Map so the bot still works without Redis.
 *
 *  2. isDuplicate    — deduplication by message content hash.
 *                      If the same phone + message text arrives twice within
 *                      DEDUP_TTL_SECONDS (webhook retry window), the second
 *                      one is silently dropped.
 */

import { upstashCache } from '../config/redisClient.js'
import logger from '../utils/logger.js'

// ─── Config ──────────────────────────────────────────────────────────────────

/** Max messages a single phone number may send within the window. */
const MAX_MESSAGES_PER_WINDOW = 10

/** Rolling window in seconds for the rate limiter. */
const WINDOW_SECONDS = 60

/** How long (seconds) to remember a message for deduplication. */
const DEDUP_TTL_SECONDS = 10

// ─── In-process fallback stores (used when Upstash is unavailable) ───────────

interface RateBucket { count: number; resetAt: number }
const localRateBuckets = new Map<string, RateBucket>()
const localDedup = new Set<string>()

// ─── Simple string hash (FNV-1a 32-bit) ─────────────────────────────────────

function hashMessage(phone: string, text: string): string {
  let h = 2166136261
  const str = `${phone}:${text}`
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = (h * 16777619) >>> 0
  }
  return h.toString(16)
}

// ─── Rate limiter ─────────────────────────────────────────────────────────────

/**
 * Returns true if the phone number has exceeded the allowed message rate.
 * The caller should drop the message and optionally warn the user.
 */
export async function isRateLimited(phone: string): Promise<boolean> {
  const key = `bot:rl:${phone}`

  if (upstashCache) {
    try {
      const raw = await upstashCache.get(key)
      const bucket: RateBucket = raw
        ? (JSON.parse(raw) as RateBucket)
        : { count: 0, resetAt: Date.now() + WINDOW_SECONDS * 1000 }

      if (Date.now() > bucket.resetAt) {
        // Window expired — reset
        bucket.count = 1
        bucket.resetAt = Date.now() + WINDOW_SECONDS * 1000
      } else {
        bucket.count++
      }

      await upstashCache.set(key, JSON.stringify(bucket), WINDOW_SECONDS)

      if (bucket.count > MAX_MESSAGES_PER_WINDOW) {
        logger.warn(`[BotGuard] Rate limit hit for ${phone} (${bucket.count} msgs / ${WINDOW_SECONDS}s)`)
        return true
      }
      return false
    } catch (err) {
      logger.error('[BotGuard] Upstash rate-limit error, skipping guard:', err)
      return false
    }
  }

  // ── In-process fallback ──
  const now = Date.now()
  const bucket = localRateBuckets.get(phone) ?? { count: 0, resetAt: now + WINDOW_SECONDS * 1000 }

  if (now > bucket.resetAt) {
    bucket.count = 1
    bucket.resetAt = now + WINDOW_SECONDS * 1000
  } else {
    bucket.count++
  }
  localRateBuckets.set(phone, bucket)

  if (bucket.count > MAX_MESSAGES_PER_WINDOW) {
    logger.warn(`[BotGuard] Rate limit hit (local) for ${phone}`)
    return true
  }
  return false
}

// ─── Deduplication ───────────────────────────────────────────────────────────

/**
 * Returns true if this exact (phone + text) combination was already seen
 * within the deduplication window — i.e. it is a webhook retry / duplicate.
 * Marks the message as seen on the first call.
 */
export async function isDuplicate(phone: string, text: string): Promise<boolean> {
  const hash = hashMessage(phone, text)
  const key = `bot:dedup:${hash}`

  if (upstashCache) {
    try {
      const existing = await upstashCache.get(key)
      if (existing) {
        logger.info(`[BotGuard] Duplicate message dropped for ${phone} (hash ${hash})`)
        return true
      }
      await upstashCache.set(key, '1', DEDUP_TTL_SECONDS)
      return false
    } catch (err) {
      logger.error('[BotGuard] Upstash dedup error, skipping guard:', err)
      return false
    }
  }

  // ── In-process fallback ──
  if (localDedup.has(hash)) {
    logger.info(`[BotGuard] Duplicate message dropped (local) for ${phone}`)
    return true
  }
  localDedup.add(hash)
  setTimeout(() => localDedup.delete(hash), DEDUP_TTL_SECONDS * 1000)
  return false
}
