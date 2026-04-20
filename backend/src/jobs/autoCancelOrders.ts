import { supabaseAdmin } from '../config/supabaseClient.js'
import { notify } from '../services/notificationService.js'
import { reversePendingCredit } from '../services/walletService.js'
import logger from '../utils/logger.js'

const DEFAULT_CANCEL_AFTER_DAYS = 5
// Pull anything paid for at least 1 day; per-order durations are then enforced in JS
const PREFILTER_CUTOFF_HOURS = 24

async function runAutoCancel() {
  try {
    const prefilterCutoff = new Date(Date.now() - PREFILTER_CUTOFF_HOURS * 60 * 60 * 1000).toISOString()
    const now = Date.now()

    // Find paid orders at least 1 day old; we'll filter further by per-order
    // delivery window below (defaulting to 5 days if the seller didn't set one).
    const baseQuery = supabaseAdmin
      .from('orders')
      .select('id, buyer_id, seller_id, quantity, total_amount, updated_at, delivery_duration_days, products(title)')
      .eq('status', 'paid')
      .lt('updated_at', prefilterCutoff)

    let { data: orders, error } = await baseQuery
    // Gracefully fall back if the delivery_duration_days column hasn't been
    // added to Supabase yet — every order is treated as the default window.
    if (error && error.message?.includes('delivery_duration_days')) {
      logger.warn('[autoCancelOrders] delivery_duration_days column missing — falling back to default window only.')
      const fallback = await supabaseAdmin
        .from('orders')
        .select('id, buyer_id, seller_id, quantity, total_amount, updated_at, products(title)')
        .eq('status', 'paid')
        .lt('updated_at', prefilterCutoff)
      orders = fallback.data as any
      error = fallback.error
    }

    if (error) {
      logger.error(`[autoCancelOrders] Query failed: ${error.message}`)
      return
    }

    if (!orders || orders.length === 0) {
      logger.info('[autoCancelOrders] No stale unshipped orders found.')
      return
    }

    // Filter by per-order delivery window
    const stale = orders.filter(o => {
      const days = (o as any).delivery_duration_days ?? DEFAULT_CANCEL_AFTER_DAYS
      const ageMs = now - new Date((o as any).updated_at).getTime()
      return ageMs >= days * 24 * 60 * 60 * 1000
    })

    if (stale.length === 0) {
      logger.info('[autoCancelOrders] No orders past their delivery window yet.')
      return
    }

    logger.info(`[autoCancelOrders] Cancelling ${stale.length} stale order(s)…`)

    for (const order of stale) {
      try {
        const { error: updateErr } = await supabaseAdmin
          .from('orders')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('id', order.id)

        if (updateErr) {
          logger.error(`[autoCancelOrders] Failed to cancel order ${order.id}: ${updateErr.message}`)
          continue
        }

        // Refund the buyer in-app and reverse the seller's pending credit
        await reversePendingCredit(
          order.seller_id,
          order.buyer_id,
          order.id,
          Number(order.total_amount) || 0,
        )

        const productTitle = (order.products as any)?.title ?? 'your item'
        const shortId = order.id.split('-')[0].toUpperCase()
        const windowDays = (order as any).delivery_duration_days ?? DEFAULT_CANCEL_AFTER_DAYS
        const dayLabel = windowDays === 1 ? '1 day' : `${windowDays} days`

        // Notify buyer — payment reversed
        await notify({
          userId: order.buyer_id,
          type: 'order_cancelled',
          title: 'Payment Reversed',
          body: `Your order #${shortId} for "${productTitle}" was cancelled — the seller did not ship within ${dayLabel}. Your payment has been reversed and refunded to your wallet.`,
          data: { url: '/dashboard/orders', orderId: order.id },
        })

        // Notify seller — they missed the window
        await notify({
          userId: order.seller_id,
          type: 'order_cancelled',
          title: 'Order Cancelled — Payment Reversed',
          body: `Order #${shortId} for "${productTitle}" was automatically cancelled and the buyer refunded because it was not shipped within ${dayLabel} of payment.`,
          data: { url: '/seller-orders', orderId: order.id },
        })

        // Email both sides via Mailtrap (fire-and-forget — bell already fired).
        ;(async () => {
          try {
            const { sendOrderCancelledEmails } = await import('../services/orderEmailService.js')
            await sendOrderCancelledEmails(
              order as any,
              productTitle,
              { autoCancelled: true, reason: `Seller did not ship within ${dayLabel}.` },
            )
          } catch (err) {
            logger.warn(`[autoCancelOrders] email failed for order ${order.id}: ${err instanceof Error ? err.message : String(err)}`)
          }
        })()

        logger.info(`[autoCancelOrders] Cancelled order ${order.id}`)
      } catch (err) {
        logger.error(`[autoCancelOrders] Unexpected error on order ${order.id}: ${err}`)
      }
    }
  } catch (err) {
    logger.error(`[autoCancelOrders] Unexpected error: ${err}`)
  }
}

export function startAutoCancelJob(intervalMs = 6 * 60 * 60 * 1000) {
  logger.info('[autoCancelOrders] Starting auto-cancel job (every 6 hours)')
  runAutoCancel()
  return setInterval(runAutoCancel, intervalMs)
}
