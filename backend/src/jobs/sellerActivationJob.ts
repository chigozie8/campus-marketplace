import { supabaseAdmin } from '../config/supabaseClient.js'
import { notify } from '../services/notificationService.js'
import { shouldSendNudge } from '../utils/nudgeTracker.js'
import logger from '../utils/logger.js'

const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000 // every 6h
const HOURS_AFTER_SIGNUP = 48

/**
 * Nudges sellers who signed up as a vendor (`is_seller=true`) but haven't created
 * any listing after 48h. Fires once per seller.
 */
async function runSellerActivationCheck() {
  try {
    const cutoff = new Date(Date.now() - HOURS_AFTER_SIGNUP * 60 * 60 * 1000).toISOString()

    const { data: sellers, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, created_at')
      .eq('is_seller', true)
      .lt('created_at', cutoff)
      .limit(500)

    if (error) {
      logger.warn(`[sellerActivation] Query failed: ${error.message}`)
      return
    }
    if (!sellers?.length) {
      logger.info('[sellerActivation] No sellers in window.')
      return
    }

    // Find sellers with at least 1 product
    const ids = sellers.map(s => s.id)
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('seller_id')
      .in('seller_id', ids)

    const hasListing = new Set((products ?? []).map(p => p.seller_id))
    const inactive = sellers.filter(s => !hasListing.has(s.id))

    if (inactive.length === 0) {
      logger.info('[sellerActivation] All sellers in window already listed.')
      return
    }

    let sent = 0
    for (const s of inactive) {
      const ok = await shouldSendNudge(s.id, 'seller_zero_listings')
      if (!ok) continue
      await notify({
        userId: s.id,
        type: 'seller_activation',
        title: '🚀 List your first item in 60 seconds',
        body: 'Your store is live but empty. Add one item and start earning today!',
        data: { url: '/seller/new' },
      })
      sent++
    }
    if (sent > 0) logger.info(`[sellerActivation] Sent ${sent} activation nudge(s).`)
  } catch (err: unknown) {
    logger.error('[sellerActivation] Unexpected error:', err instanceof Error ? err.message : String(err))
  }
}

export function startSellerActivationJob() {
  logger.info('[sellerActivation] Seller activation job started — every 6h.')
  runSellerActivationCheck()
  setInterval(runSellerActivationCheck, CHECK_INTERVAL_MS)
}
