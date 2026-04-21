import { supabaseAdmin } from '../config/supabaseClient.js'
import { notify } from '../services/notificationService.js'
import { shouldSendNudge } from '../utils/nudgeTracker.js'
import logger from '../utils/logger.js'

const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000 // every 6h
const DAYS_AFTER_DELIVERY = 3

/**
 * Asks buyers to leave a review 3 days after their order was delivered/completed,
 * if they haven't already left one. Fires once per (buyer, order).
 */
async function runReviewRequestCheck() {
  try {
    const cutoff = new Date(Date.now() - DAYS_AFTER_DELIVERY * 24 * 60 * 60 * 1000).toISOString()

    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('id, buyer_id, seller_id, product_id, delivered_at, status, products(title)')
      .in('status', ['completed', 'delivered'])
      .lt('delivered_at', cutoff)
      .not('delivered_at', 'is', null)
      .limit(500)

    if (error) {
      logger.warn(`[reviewRequest] Query failed: ${error.message}`)
      return
    }
    if (!orders?.length) {
      logger.info('[reviewRequest] No eligible orders.')
      return
    }

    // Skip orders that already have a review
    const orderIds = orders.map(o => o.id)
    const { data: reviews } = await supabaseAdmin
      .from('reviews')
      .select('order_id')
      .in('order_id', orderIds)
      .then(r => r, () => ({ data: [] }))

    const reviewed = new Set((reviews ?? []).map((r: { order_id: string }) => r.order_id))
    const eligible = orders.filter(o => !reviewed.has(o.id))

    let sent = 0
    for (const o of eligible) {
      const ok = await shouldSendNudge(o.buyer_id, 'review_request', o.id)
      if (!ok) continue
      const productTitle =
        (o.products as { title?: string } | null)?.title ?? 'your recent purchase'
      await notify({
        userId: o.buyer_id,
        type: 'review_request',
        title: '⭐ How was your order?',
        body: `Leave a quick review for "${productTitle}" — it takes 10 seconds and helps other buyers.`,
        data: { url: `/dashboard/orders/${o.id}` },
      })
      sent++
    }
    if (sent > 0) logger.info(`[reviewRequest] Sent ${sent} review request(s).`)
  } catch (err: unknown) {
    logger.error('[reviewRequest] Unexpected error:', err instanceof Error ? err.message : String(err))
  }
}

export function startReviewRequestJob() {
  logger.info('[reviewRequest] Review request job started — every 6h.')
  runReviewRequestCheck()
  setInterval(runReviewRequestCheck, CHECK_INTERVAL_MS)
}
