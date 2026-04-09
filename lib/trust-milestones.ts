import { createClient as createAdmin } from '@supabase/supabase-js'
import { computeBuyerScore, computeSellerScore, MILESTONES } from './trust'

function svc() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

// Stable dedup key — independent of notification title copy
function milestoneType(role: 'buyer' | 'seller', score: number) {
  return `milestone_${role}_${score}`
}

export async function checkAndNotifyBuyerMilestones(buyerId: string) {
  try {
    const db = svc()

    const [profileRes, ordersRes, disputesRes] = await Promise.all([
      db.from('profiles').select('id, created_at').eq('id', buyerId).single(),
      db.from('orders').select('id, status').eq('buyer_id', buyerId),
      db.from('order_disputes').select('id, status').eq('buyer_id', buyerId).then(r => r, () => ({ data: [] as Array<{ id: string; status: string }> | null })),
    ])

    if (!profileRes.data) return

    const profile = profileRes.data
    const orders = ordersRes.data ?? []
    const disputes = (disputesRes.data ?? []) as Array<{ id: string; status: string }>
    const completedOrders = orders.filter(o => o.status === 'completed').length
    const accountAgeDays = Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))

    const { score } = computeBuyerScore({ completedOrders, buyerDisputes: disputes, accountAgeDays })

    const reachedMilestones = MILESTONES.filter(m => score >= m.score)

    for (const milestone of reachedMilestones) {
      const stableType = milestoneType('buyer', milestone.score)
      const { data: existing } = await db
        .from('notifications')
        .select('id')
        .eq('user_id', buyerId)
        .eq('type', stableType)
        .limit(1)
        .maybeSingle()

      if (!existing) {
        await db.from('notifications').insert({
          user_id: buyerId,
          title: `🏅 ${milestone.label} Unlocked!`,
          body: `Congratulations! You've reached a trust score of ${milestone.score}+ and earned the ${milestone.emoji} ${milestone.label} badge. Keep it up!`,
          type: stableType,
        })
      }
    }
  } catch {
    // Non-critical — silently ignore errors
  }
}

export async function checkAndNotifySellerMilestones(sellerId: string) {
  try {
    const db = svc()

    const [profileRes, disputesRes] = await Promise.all([
      db.from('profiles').select('id, seller_verified, rating, total_sales, created_at').eq('id', sellerId).single(),
      db.from('order_disputes').select('id, status').eq('seller_id', sellerId).then(r => r, () => ({ data: [] as Array<{ id: string; status: string }> | null })),
    ])

    if (!profileRes.data) return

    const profile = profileRes.data
    const disputes = (disputesRes.data ?? []) as Array<{ id: string; status: string }>
    const accountAgeDays = Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))

    const { score } = computeSellerScore({
      rating: profile.rating ?? 0,
      totalSales: profile.total_sales ?? 0,
      sellerVerified: profile.seller_verified ?? false,
      sellerDisputes: disputes,
      accountAgeDays,
    })

    const reachedMilestones = MILESTONES.filter(m => score >= m.score)

    for (const milestone of reachedMilestones) {
      const stableType = milestoneType('seller', milestone.score)
      const { data: existing } = await db
        .from('notifications')
        .select('id')
        .eq('user_id', sellerId)
        .eq('type', stableType)
        .limit(1)
        .maybeSingle()

      if (!existing) {
        await db.from('notifications').insert({
          user_id: sellerId,
          title: `🏅 ${milestone.label} Unlocked!`,
          body: `Congratulations! Your seller trust score has reached ${milestone.score}+ — you've earned the ${milestone.emoji} ${milestone.label} badge!`,
          type: stableType,
        })
      }
    }
  } catch {
    // Non-critical — silently ignore errors
  }
}
