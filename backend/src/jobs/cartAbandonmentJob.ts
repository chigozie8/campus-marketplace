import { supabaseAdmin } from '../config/supabaseClient.js'
import { notify } from '../services/notificationService.js'
import logger from '../utils/logger.js'

const ABANDON_AFTER_HOURS = 2
const CHECK_INTERVAL_MS = 60 * 60 * 1000 // every hour

async function runCartAbandonmentCheck() {
  try {
    const cutoff = new Date(Date.now() - ABANDON_AFTER_HOURS * 60 * 60 * 1000).toISOString()

    // Find cart items older than threshold where user hasn't placed an order for those products recently
    const { data: cartItems, error } = await supabaseAdmin
      .from('cart_items')
      .select('user_id, product_id, added_at, products(title, price, images)')
      .lt('added_at', cutoff)
      .eq('reminder_sent', false)

    if (error) {
      logger.warn(`[cartAbandonment] Query failed (table may not exist yet): ${error.message}`)
      return
    }

    if (!cartItems || cartItems.length === 0) {
      logger.info('[cartAbandonment] No abandoned carts found.')
      return
    }

    // Group by user
    const byUser = new Map<string, typeof cartItems>()
    for (const item of cartItems) {
      const list = byUser.get(item.user_id) ?? []
      list.push(item)
      byUser.set(item.user_id, list)
    }

    logger.info(`[cartAbandonment] Sending reminders to ${byUser.size} user(s)…`)

    for (const [userId, items] of byUser) {
      const firstProduct = items[0].products as { title: string; price: number; images: string[] } | null
      const title = items.length === 1
        ? `You left something behind!`
        : `You have ${items.length} items waiting`
      const body = firstProduct
        ? `${firstProduct.title} is still in your cart. Complete your order before it sells out!`
        : `Items in your cart are waiting for you. Come back and complete your purchase!`

      await notify({ userId, type: 'cart_reminder', title, body, data: { url: '/marketplace' } })

      // Mark reminders as sent
      const productIds = items.map(i => i.product_id)
      await supabaseAdmin
        .from('cart_items')
        .update({ reminder_sent: true })
        .eq('user_id', userId)
        .in('product_id', productIds)
    }

    logger.info(`[cartAbandonment] Sent ${byUser.size} cart reminder(s).`)
  } catch (err: unknown) {
    logger.error('[cartAbandonment] Unexpected error:', err instanceof Error ? err.message : String(err))
  }
}

export function startCartAbandonmentJob() {
  logger.info('[cartAbandonment] Cart abandonment job started — checking every 1h.')
  runCartAbandonmentCheck()
  setInterval(runCartAbandonmentCheck, CHECK_INTERVAL_MS)
}
