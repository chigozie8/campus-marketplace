import { supabaseAdmin } from '../config/supabaseClient.js'
import { notify } from '../services/notificationService.js'
import logger from '../utils/logger.js'

const INACTIVE_DAYS = 7
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000 // every 6h

const MESSAGES = [
  { title: '👋 We miss you!', body: 'New listings have arrived since you were last here. Come check out what\'s new on campus!' },
  { title: '🛍️ Back already?', body: 'Your campus marketplace has fresh deals waiting. Don\'t miss out!' },
  { title: '🔥 Hot right now', body: 'Students near you are selling great stuff. Come see what\'s trending!' },
]

async function runInactivityCheck() {
  try {
    const cutoff = new Date(Date.now() - INACTIVE_DAYS * 24 * 60 * 60 * 1000).toISOString()
    const recentCutoff = new Date(Date.now() - (INACTIVE_DAYS + 1) * 24 * 60 * 60 * 1000).toISOString()

    // Find users who haven't had a notification (proxy for activity) in 7-8 days
    // to avoid spamming — only target users in exactly the 7-day window
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .lt('updated_at', cutoff)
      .gt('updated_at', recentCutoff)
      .limit(200)

    if (error) {
      logger.warn(`[inactivity] Query failed: ${error.message}`)
      return
    }

    if (!profiles || profiles.length === 0) {
      logger.info('[inactivity] No inactive users in window.')
      return
    }

    // Only notify users who have push subscriptions (avoid spamming email-only users)
    const userIds = profiles.map(p => p.id)
    const { data: subs } = await supabaseAdmin
      .from('push_subscriptions')
      .select('user_id')
      .in('user_id', userIds)

    const activeSubIds = new Set((subs ?? []).map(s => s.user_id))
    const toNotify = userIds.filter(id => activeSubIds.has(id))

    if (toNotify.length === 0) {
      logger.info('[inactivity] No subscribed inactive users.')
      return
    }

    const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)]
    logger.info(`[inactivity] Re-engaging ${toNotify.length} inactive user(s)…`)

    for (const userId of toNotify) {
      await notify(userId, msg.title, msg.body, 'reengagement')
    }

    logger.info(`[inactivity] Sent ${toNotify.length} re-engagement notification(s).`)
  } catch (err: unknown) {
    logger.error('[inactivity] Unexpected error:', err instanceof Error ? err.message : String(err))
  }
}

export function startInactivityJob() {
  logger.info('[inactivity] Inactivity re-engagement job started — checking every 6h.')
  runInactivityCheck()
  setInterval(runInactivityCheck, CHECK_INTERVAL_MS)
}
