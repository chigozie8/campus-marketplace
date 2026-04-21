import { supabaseAdmin } from '../config/supabaseClient.js'
import { notify } from '../services/notificationService.js'
import { shouldSendNudge } from '../utils/nudgeTracker.js'
import logger from '../utils/logger.js'

const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000 // once a day
const MIN_AMOUNT = 100 // ₦100 minimum to bother nudging

/**
 * Reminds sellers who have unclaimed cash sitting in their wallet's `available`
 * balance to request a payout. De-duped weekly per seller.
 */
function weekKey() {
  const now = new Date()
  const onejan = new Date(now.getFullYear(), 0, 1)
  const week = Math.ceil(((now.getTime() - onejan.getTime()) / 86_400_000 + onejan.getDay() + 1) / 7)
  return `${now.getFullYear()}-W${week}`
}

async function runPayoutReminderCheck() {
  try {
    const { data: wallets, error } = await supabaseAdmin
      .from('wallets')
      .select('user_id, available')
      .gte('available', MIN_AMOUNT)
      .limit(500)

    if (error) {
      logger.warn(`[payoutReminder] Query failed: ${error.message}`)
      return
    }
    if (!wallets?.length) {
      logger.info('[payoutReminder] No wallets with claimable balance.')
      return
    }

    const wk = weekKey()
    let sent = 0
    for (const w of wallets) {
      const ok = await shouldSendNudge(w.user_id, 'payout_available', wk)
      if (!ok) continue
      const amount = Number(w.available).toLocaleString()
      await notify({
        userId: w.user_id,
        type: 'payout_available',
        title: '💰 You have ₦' + amount + ' ready to withdraw',
        body: 'Your earnings are sitting in your wallet. Cash out to your bank in 1 tap.',
        data: { url: '/dashboard/wallet' },
      })
      sent++
    }
    if (sent > 0) logger.info(`[payoutReminder] Sent ${sent} payout reminder(s).`)
  } catch (err: unknown) {
    logger.error('[payoutReminder] Unexpected error:', err instanceof Error ? err.message : String(err))
  }
}

export function startPayoutReminderJob() {
  logger.info('[payoutReminder] Payout reminder job started — once a day.')
  runPayoutReminderCheck()
  setInterval(runPayoutReminderCheck, CHECK_INTERVAL_MS)
}
