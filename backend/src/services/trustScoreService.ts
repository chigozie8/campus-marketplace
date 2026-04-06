import { supabaseAdmin } from '../config/supabaseClient.js'
import logger from '../utils/logger.js'

interface VendorStats {
  total_orders: number
  successful_orders: number
  disputes_count: number
  average_rating: number
}

/**
 * Calculate trust score (0–100):
 *   40% — order completion rate  (successful / total)
 *   30% — average rating         (rating / 5)
 *   30% — dispute-free rate      (1 - disputes / total)
 *
 * Division-by-zero safe: if no orders yet, score is rating-only.
 */
export function calculateTrustScore(stats: VendorStats): number {
  const { total_orders, successful_orders, disputes_count, average_rating } = stats

  const ratingScore = (average_rating / 5) * 30

  if (total_orders === 0) {
    return Math.round(ratingScore * 100) / 100
  }

  const completionRate  = Math.min(successful_orders / total_orders, 1)
  const disputeFreeRate = Math.max(1 - disputes_count / total_orders, 0)

  const score = completionRate * 40 + ratingScore + disputeFreeRate * 30
  return Math.round(Math.min(Math.max(score, 0), 100) * 100) / 100
}

/**
 * Fetch vendor stats from DB and recalculate + persist trust score.
 */
export async function recalculateTrustScore(vendorId: string): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('total_orders, successful_orders, failed_orders, disputes_count, average_rating, rating')
    .eq('id', vendorId)
    .single()

  if (error || !data) {
    logger.warn(`[trustScore] Could not fetch vendor ${vendorId}: ${error?.message}`)
    return
  }

  const stats: VendorStats = {
    total_orders:      data.total_orders      ?? 0,
    successful_orders: data.successful_orders ?? 0,
    disputes_count:    data.disputes_count    ?? 0,
    average_rating:    data.average_rating ?? data.rating ?? 0,
  }

  const trust_score = calculateTrustScore(stats)

  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({ trust_score })
    .eq('id', vendorId)

  if (updateError) {
    logger.error(`[trustScore] Failed to update vendor ${vendorId}: ${updateError.message}`)
  } else {
    logger.info(`[trustScore] Vendor ${vendorId} → trust_score=${trust_score}`)
  }
}

/**
 * Increment a vendor's order counters and trigger trust score recalc.
 */
export async function onOrderCompleted(vendorId: string): Promise<void> {
  await supabaseAdmin.rpc('increment_vendor_orders', {
    p_vendor_id: vendorId,
    p_successful: 1,
  }).then(({ error }) => {
    if (error) logger.warn(`[trustScore] increment_vendor_orders: ${error.message}`)
  })
  await recalculateTrustScore(vendorId)
}

export async function onOrderFailed(vendorId: string): Promise<void> {
  await supabaseAdmin.rpc('increment_vendor_orders', {
    p_vendor_id: vendorId,
    p_successful: 0,
  }).then(({ error }) => {
    if (error) logger.warn(`[trustScore] increment_vendor_orders: ${error.message}`)
  })
  await recalculateTrustScore(vendorId)
}

export async function onDisputeCreated(vendorId: string): Promise<void> {
  await supabaseAdmin
    .from('profiles')
    .update({ disputes_count: supabaseAdmin.rpc('increment_disputes', { p_vendor_id: vendorId }) as unknown as number })
    .eq('id', vendorId)

  await supabaseAdmin.rpc('increment_vendor_disputes', { p_vendor_id: vendorId })
    .then(({ error }) => {
      if (error) logger.warn(`[trustScore] increment_vendor_disputes: ${error.message}`)
    })

  await recalculateTrustScore(vendorId)
}

export async function onRatingSubmitted(vendorId: string, newRating: number): Promise<void> {
  const { data } = await supabaseAdmin
    .from('reviews')
    .select('rating')
    .eq('seller_id', vendorId)

  if (data && data.length > 0) {
    const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length
    await supabaseAdmin
      .from('profiles')
      .update({ average_rating: Math.round(avg * 100) / 100 })
      .eq('id', vendorId)
  }

  await recalculateTrustScore(vendorId)
}
