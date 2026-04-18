import { supabaseAdmin } from '../config/supabaseClient.js'
import * as walletService from '../services/walletService.js'
import logger from '../utils/logger.js'

const RELEASE_AFTER_HOURS = 48

async function triggerMilestoneCheck(userId: string, role: 'buyer' | 'seller' | 'both') {
  try {
    const appUrl = process.env.FRONTEND_URL ?? process.env.APP_URL ?? 'http://localhost:5000'
    const res = await fetch(`${appUrl}/api/internal/check-milestones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': process.env.INTERNAL_API_KEY ?? '',
      },
      body: JSON.stringify({ userId, role }),
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) {
      logger.warn(`[milestones] auto-release trigger failed for ${userId} (${role}): HTTP ${res.status}`)
    }
  } catch (err) {
    logger.warn(`[milestones] auto-release trigger error for ${userId} (${role}): ${err}`)
  }
}

export async function runAutoRelease() {
  try {
    const cutoff = new Date(Date.now() - RELEASE_AFTER_HOURS * 60 * 60 * 1000).toISOString()

    // Sellers can no longer mark orders as "delivered" themselves (fraud
    // prevention) — so the escrow now also releases orders that have been
    // sitting in "shipped" for >48 h without buyer confirmation. Legacy
    // "delivered" rows are still picked up so existing orders complete.
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('id, buyer_id, seller_id, total_amount')
      .in('status', ['shipped', 'delivered'])
      .lt('updated_at', cutoff)

    if (error) {
      logger.error(`[escrowAutoRelease] Query failed: ${error.message}`)
      return
    }

    const orders = data

    if (!orders || orders.length === 0) {
      logger.info('[escrowAutoRelease] No expired escrow orders found.')
      return
    }

    logger.info(`[escrowAutoRelease] Releasing ${orders.length} expired escrow order(s)…`)

    for (const order of orders) {
      try {
        // Status-guarded update: only flip to "completed" if the order is
        // still in shipped/delivered. If a concurrent buyer-verification has
        // already completed the order, this update affects 0 rows and we
        // skip the wallet release so funds aren't double-credited.
        const { data: claimed, error: claimErr } = await supabaseAdmin
          .from('orders')
          .update({ status: 'completed', updated_at: new Date().toISOString() })
          .eq('id', order.id)
          .in('status', ['shipped', 'delivered'])
          .select('id')

        if (claimErr) {
          logger.error(`[escrowAutoRelease] Claim update failed for ${order.id}: ${claimErr.message}`)
          continue
        }
        if (!claimed || claimed.length === 0) {
          logger.info(`[escrowAutoRelease] Order ${order.id} already completed by buyer — skipping release.`)
          continue
        }

        await walletService.releaseSellerEarnings(order.seller_id, order.id)

        await supabaseAdmin.from('notifications').insert({
          user_id: order.seller_id,
          title: 'Payment Released',
          body: `Your payment for order #${order.id.split('-')[0]} has been automatically released after 48 hours.`,
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
