import { supabaseAdmin } from '../config/supabaseClient.js'
import { notify } from '../services/notificationService.js'
import logger from '../utils/logger.js'

const CHECK_INTERVAL_MS = 60 * 60 * 1000 // check every hour, fire on Monday

function isMonday9am() {
  const now = new Date()
  return now.getDay() === 1 && now.getHours() === 9
}

async function runWeeklySellerDigest() {
  if (!isMonday9am()) return

  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    // Get all active sellers
    const { data: sellers, error: sellersErr } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name')
      .eq('is_seller', true)

    if (sellersErr || !sellers) {
      logger.error(`[weeklyDigest] Failed to fetch sellers: ${sellersErr?.message}`)
      return
    }

    logger.info(`[weeklyDigest] Building digest for ${sellers.length} seller(s)…`)

    // Get all orders from the past week
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('id, seller_id, total_amount, status, created_at')
      .gte('created_at', weekAgo)

    // Get all product views from the past week
    const { data: views } = await supabaseAdmin
      .from('product_views')
      .select('product_id, products(seller_id)')
      .gte('created_at', weekAgo)
      .then(r => r, () => ({ data: [] }))

    const ordersBySeller: Record<string, typeof orders> = {}
    for (const o of orders ?? []) {
      if (!ordersBySeller[o.seller_id]) ordersBySeller[o.seller_id] = []
      ordersBySeller[o.seller_id]!.push(o)
    }

    const viewsBySeller: Record<string, number> = {}
    for (const v of (views as Array<{ products: { seller_id: string } | null }> ?? [])) {
      const sid = v.products?.seller_id
      if (sid) viewsBySeller[sid] = (viewsBySeller[sid] ?? 0) + 1
    }

    for (const seller of sellers) {
      const myOrders = ordersBySeller[seller.id] ?? []
      const completedOrders = myOrders.filter(o => o.status === 'completed')
      const revenue = completedOrders.reduce((sum, o) => sum + Number(o.total_amount), 0)
      const totalViews = viewsBySeller[seller.id] ?? 0
      const newOrders = myOrders.length

      if (newOrders === 0 && totalViews === 0) continue // skip silent sellers

      const title = `📊 Your weekly summary is ready`
      const body = [
        `This week: ${newOrders} order${newOrders !== 1 ? 's' : ''}`,
        revenue > 0 ? `₦${revenue.toLocaleString()} earned` : null,
        totalViews > 0 ? `${totalViews} listing view${totalViews !== 1 ? 's' : ''}` : null,
      ].filter(Boolean).join(' · ')

      await notify(seller.id, title, body, 'weekly_digest')
    }

    logger.info('[weeklyDigest] Weekly seller digests sent.')
  } catch (err: unknown) {
    logger.error('[weeklyDigest] Unexpected error:', err instanceof Error ? err.message : String(err))
  }
}

export function startWeeklySellerDigestJob() {
  logger.info('[weeklyDigest] Weekly seller digest job started — fires on Mondays at 9am.')
  runWeeklySellerDigest()
  setInterval(runWeeklySellerDigest, CHECK_INTERVAL_MS)
}
