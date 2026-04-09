import { supabaseAdmin } from '../config/supabaseClient.js'
import logger from '../utils/logger.js'

const STALE_AFTER_MINUTES = 30

async function runLocationCleanup() {
  try {
    const cutoff = new Date(Date.now() - STALE_AFTER_MINUTES * 60 * 1000).toISOString()

    const { error, count } = await supabaseAdmin
      .from('vendor_locations')
      .delete({ count: 'exact' })
      .lt('updated_at', cutoff)

    if (error) {
      logger.error(`[locationCleanup] Delete failed: ${error.message}`)
      return
    }

    if ((count ?? 0) > 0) {
      logger.info(`[locationCleanup] Removed ${count} stale vendor location(s).`)
    } else {
      logger.info('[locationCleanup] No stale vendor locations found.')
    }
  } catch (err) {
    logger.error(`[locationCleanup] Unexpected error: ${err}`)
  }
}

export function startLocationCleanupJob(intervalMs = 30 * 60 * 1000) {
  logger.info('[locationCleanup] Starting location cleanup job (every 30 min)')
  runLocationCleanup()
  return setInterval(runLocationCleanup, intervalMs)
}
