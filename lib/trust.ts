export type TrustLevel = 'excellent' | 'good' | 'fair' | 'low'

export type TrustScoreBreakdown = {
  base: number
  ordersBonus?: number
  noDisputeBonus?: number
  disputeLossPenalty?: number
  disputeWinPenalty?: number
  ageBonus?: number
  ratingBonus?: number
  salesBonus?: number
  verifiedBonus?: number
  sellerDisputePenalty?: number
}

export type ComputedScore = {
  score: number
  level: TrustLevel
  label: string
  breakdown: TrustScoreBreakdown
  completedOrders?: number
  totalDisputes?: number
  totalSales?: number
  rating?: number
}

export function levelFor(score: number): TrustLevel {
  if (score >= 85) return 'excellent'
  if (score >= 70) return 'good'
  if (score >= 50) return 'fair'
  return 'low'
}

export function labelFor(level: TrustLevel) {
  return { excellent: 'Excellent', good: 'Good', fair: 'Fair', low: 'Low' }[level]
}

export function computeBuyerScore({
  completedOrders,
  buyerDisputes,
  accountAgeDays,
}: {
  completedOrders: number
  buyerDisputes: Array<{ id: string; status: string }>
  accountAgeDays: number
}): ComputedScore {
  const base = 60
  const ordersBonus = Math.min(completedOrders * 2, 20)
  const noDisputeBonus = buyerDisputes.length === 0 ? 10 : 0
  const disputeLossPenalty = buyerDisputes.filter(d => d.status === 'resolved_seller').length * 20
  const disputeWinPenalty = buyerDisputes.filter(d => d.status === 'resolved_buyer').length * 5
  const ageBonus = accountAgeDays >= 180 ? 10 : accountAgeDays >= 90 ? 5 : 0

  const score = Math.max(0, Math.min(100, base + ordersBonus + noDisputeBonus - disputeLossPenalty - disputeWinPenalty + ageBonus))
  const level = levelFor(score)

  return {
    score,
    level,
    label: labelFor(level),
    breakdown: {
      base,
      ordersBonus,
      noDisputeBonus,
      disputeLossPenalty: -disputeLossPenalty,
      disputeWinPenalty: -disputeWinPenalty,
      ageBonus,
    },
    totalDisputes: buyerDisputes.length,
    completedOrders,
  }
}

export function computeSellerScore({
  rating,
  totalSales,
  sellerVerified,
  sellerDisputes,
  accountAgeDays,
}: {
  rating: number
  totalSales: number
  sellerVerified: boolean
  sellerDisputes: Array<{ id: string; status: string }>
  accountAgeDays: number
}): ComputedScore {
  const base = 50
  const ratingBonus = Math.round((rating / 5) * 25)
  const salesBonus = Math.round(Math.min(totalSales, 20) / 20 * 15)
  const verifiedBonus = sellerVerified ? 10 : 0
  const sellerDisputePenalty = sellerDisputes.filter(d => d.status === 'resolved_buyer').length * 10
  const ageBonus = accountAgeDays >= 180 ? 10 : accountAgeDays >= 90 ? 5 : 0

  const score = Math.max(0, Math.min(100, base + ratingBonus + salesBonus + verifiedBonus - sellerDisputePenalty + ageBonus))
  const level = levelFor(score)

  return {
    score,
    level,
    label: labelFor(level),
    breakdown: {
      base,
      ratingBonus,
      salesBonus,
      verifiedBonus,
      sellerDisputePenalty: -sellerDisputePenalty,
      ageBonus,
    },
    totalSales,
    rating,
  }
}

export function quickSellerScore({
  rating,
  totalSales,
  sellerVerified,
}: {
  rating: number
  totalSales: number
  sellerVerified: boolean
}): number {
  const base = 50
  const ratingBonus = Math.round((rating / 5) * 25)
  const salesBonus = Math.round(Math.min(totalSales, 20) / 20 * 15)
  const verifiedBonus = sellerVerified ? 10 : 0
  return Math.max(0, Math.min(100, base + ratingBonus + salesBonus + verifiedBonus))
}

export const MILESTONES = [
  { score: 70, label: 'Trusted Buyer', emoji: '✅' },
  { score: 85, label: 'Verified Member', emoji: '⭐' },
  { score: 100, label: 'VendoorX Champion', emoji: '🏆' },
] as const
