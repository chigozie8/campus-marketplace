import { supabaseAdmin } from '../config/supabaseClient.js'
import { notify } from '../services/notificationService.js'
import { reversePendingCredit } from '../services/walletService.js'
import logger from '../utils/logger.js'

const CANCEL_AFTER_HOURS = 24

async function runAutoCancel() {
  try {
    const cutoff = new Date(Date.now() - CANCEL_AFTER_HOURS * 60 * 60 * 1000).toISOString()

    // Find paid orders older than CANCEL_AFTER_DAYS with no ship date
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('id, buyer_id, seller_id, total_amount, products(title)')
      .eq('status', 'paid')
      .lt('updated_at', cutoff)

    if (error) {
      logger.error(`[autoCancelOrders] Query failed: ${error.message}`)
      return
    }

    if (!orders || orders.length === 0) {
      logger.info('[autoCancelOrders] No stale unshipped orders found.')
      return
    }

    logger.info(`[autoCancelOrders] Cancelling ${orders.length} stale order(s)…`)

    for (const order of orders) {
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

        // Notify buyer — payment reversed
        await notify({
          userId: order.buyer_id,
          type: 'order_cancelled',
          title: 'Payment Reversed',
          body: `Your order #${shortId} for "${productTitle}" was cancelled — the seller did not ship within ${CANCEL_AFTER_HOURS} hours. Your payment has been reversed and refunded to your wallet.`,
          data: { url: '/dashboard/orders', orderId: order.id },
        })

        // Notify seller — they missed the window
        await notify({
          userId: order.seller_id,
          type: 'order_cancelled',
          title: 'Order Cancelled — Payment Reversed',
          body: `Order #${shortId} for "${productTitle}" was automatically cancelled and the buyer refunded because it was not shipped within ${CANCEL_AFTER_HOURS} hours of payment.`,
          data: { url: '/seller-orders', orderId: order.id },
        })

        logger.info(`[autoCancelOrders] Cancelled order ${order.id}`)
      } catch (err) {
        logger.error(`[autoCancelOrders] Unexpected error on order ${order.id}: ${err}`)
      }
    }
  } catch (err) {
    logger.error(`[autoCancelOrders] Unexpected error: ${err}`)
  }
}

export function startAutoCancelJob(intervalMs = 60 * 60 * 1000) {
  logger.info('[autoCancelOrders] Starting auto-cancel job (every 1 hour)')
  runAutoCancel()
  return setInterval(runAutoCancel, intervalMs)
}
