import { supabaseAdmin } from '../config/supabaseClient.js'
import logger from './logger.js'

/**
 * Lightweight dedupe layer for lifecycle nudges. Records each (user, nudge_key, ref_id)
 * tuple in `user_nudges` so we never re-spam the same person for the same reason.
 *
 * Returns `true` if this is the first time we've sent the nudge (caller should send it),
 * or `false` if we've already sent it (caller should skip).
 *
 * Falls open (returns true) if the table is missing — keeps jobs working before migration.
 */
export async function shouldSendNudge(
  userId: string,
  nudgeKey: string,
  refId: string | null = null,
): Promise<boolean> {
  try {
    // ref_id is stored as '' (not NULL) so the unique constraint dedupes —
    // Postgres treats NULLs as distinct, which would silently allow duplicates.
    const { error } = await supabaseAdmin
      .from('user_nudges')
      .insert({ user_id: userId, nudge_key: nudgeKey, ref_id: refId ?? '' })
    if (!error) return true
    // 23505 = unique_violation → nudge already sent
    if (error.code === '23505') return false
    // Table missing or any other error → log + fall open so we don't silently stop nudging
    if (error.code === '42P01') {
      logger.warn('[nudgeTracker] user_nudges table missing — run scripts/035_user_nudges.sql')
      return true
    }
    logger.warn(`[nudgeTracker] insert failed (${error.code}): ${error.message}`)
    return true
  } catch (err) {
    logger.warn(`[nudgeTracker] unexpected error: ${err}`)
    return true
  }
}
