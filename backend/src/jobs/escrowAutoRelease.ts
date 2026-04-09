import { supabaseAdmin } from '../config/supabaseClient.js'
import * as walletService from '../services/walletService.js'
import logger from '../utils/logger.js'

const RELEASE_AFTER_HOURS = 48

async function triggerMilestoneCheck(userId: string, role: 'buyer' | 'seller' | 'both') {
  try {
    const appUrl = process.env.FRONTEND_URL ?? process.env.APP_URL ?? 'http://localhost:5000'
    await fetch(`${appUrl}/api/internal/check-milestones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': process.env.INTERNAL_API_KEY ?? '',
      },
      body: JSON.stringify({ userId, role }),
      signal: AbortSignal.timeout(4000),
    })
  } catch {
    // Non-critical — milestone notifications are best-effort
  }
}

export async function runAutoRelease() {
  try {
    const cutoff = new Date(Date.now() - RELEASE_AFTER_HOURS * 60 * 60 * 1000).toISOString()

    // Try delivered_at first, fall back to updated_at if column doesn't exist
    let data: Array<{ id: string; buyer_id: string; seller_id: string; total_amount: number }> | null = null

    const byDeliveredAt = await supabaseAdmin
      .from('orders')
      .select('id, buyer_id, seller_id, total_amount')
      .eq('status', 'delivered')
      .lt('delivered_at', cutoff)

    if (byDeliveredAt.error?.message?.includes('does not exist')) {
      // delivered_at column missing — fall back to updated_at
      const byUpdatedAt = await supabaseAdmin
        .from('orders')
        .select('id, buyer_id, seller_id, total_amount')
        .eq('status', 'delivered')
        .lt('updated_at', cutoff)
      if (byUpdatedAt.error) {
        logger.error(`[escrowAutoRelease] Query failed: ${byUpdatedAt.error.message}`)
        return
      }
      data = byUpdatedAt.data
    } else if (byDeliveredAt.error) {
      logger.error(`[escrowAutoRelease] Query failed: ${byDeliveredAt.error.message}`)
      return
    } else {
      data = byDeliveredAt.data
    }

    const orders = data

    if (!orders || orders.length === 0) {
      logger.info('[escrowAutoRelease] No expired escrow orders found.')
      return
    }

    logger.info(`[escrowAutoRelease] Releasing ${orders.length} expired escrow order(s)…`)

    for (const order of orders) {
      try {
        await supabaseAdmin
          .from('orders')
          .update({ status: 'completed', updated_at: new Date().toISOString() })
          .eq('id', order.id)

        await walletService.releaseSellerEarnings(order.seller_id, order.id)

        await supabaseAdmin.from('notifications').insert({
          user_id: order.seller_id,
          title: 'Payment Released',
          message: `Your payment for order #${order.id.split('-')[0]} has been automatically released after 48 hours.`,
          type: 'system',
        }).catch(() => {})

        // Fire-and-forget milestone checks for buyer and seller on auto-release completion
        if (order.buyer_id) triggerMilestoneCheck(order.buyer_id, 'buyer')
        triggerMilestoneCheck(order.seller_id, 'seller')

        logger.info(`[escrowAutoRelease] Released order ${order.id} for seller ${order.seller_id}`)
      } catch (err) {
        logger.error(`[escrowAutoRelease] Failed to release order ${order.id}: ${err}`)
      }
    }
  } catch (err) {
    logger.error(`[escrowAutoRelease] Unexpected error: ${err}`)
  }
}

export function startAutoReleaseJob(intervalMs = 60 * 60 * 1000) {
  logger.info('[escrowAutoRelease] Starting escrow auto-release job (every 1 hour)')
  runAutoRelease()
  return setInterval(runAutoRelease, intervalMs)
}
