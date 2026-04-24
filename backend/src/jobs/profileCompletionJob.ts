import { supabaseAdmin } from '../config/supabaseClient.js'
import { notify } from '../services/notificationService.js'
import { shouldSendNudge } from '../utils/nudgeTracker.js'
import logger from '../utils/logger.js'

const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000 // every 6h
const HOURS_AFTER_SIGNUP = 24

/**
 * Nudges users who signed up but haven't uploaded a profile photo (avatar_url is null)
 * after ~24h. Fires once per user (deduped via user_nudges).
 */
async function runProfileCompletionCheck() {
  try {
    const cutoff = new Date(Date.now() - HOURS_AFTER_SIGNUP * 60 * 60 * 1000).toISOString()

    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, avatar_url, created_at')
      .is('avatar_url', null)
      .lt('created_at', cutoff)
      .limit(200)

    if (error) {
      logger.warn(`[profileCompletion] Query failed: ${error.message}`)
      return
    }
    if (!profiles?.length) {
      logger.info('[profileCompletion] Nothing to nudge.')
      return
    }

    let sent = 0
    for (const p of profiles) {
      const ok = await shouldSendNudge(p.id, 'profile_no_avatar')
      if (!ok) continue
      await notify({
        userId: p.id,
        type: 'profile_incomplete',
        title: '📸 Add a profile photo',
        body: 'Profiles with photos get up to 3× more responses. Add yours in 30 seconds.',
        data: { url: '/profile' },
      })
      sent++
    }
    if (sent > 0) logger.info(`[profileCompletion] Sent ${sent} nudge(s).`)
  } catch (err: unknown) {
    logger.error('[profileCompletion] Unexpected error:', err instanceof Error ? err.message : String(err))
  }
}

export function startProfileCompletionJob() {
  logger.info('[profileCompletion] Profile-photo nudge job started — every 6h.')
  runProfileCompletionCheck()
  setInterval(runProfileCompletionCheck, CHECK_INTERVAL_MS)
}
