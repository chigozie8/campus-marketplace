import { NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

function svc() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export type TrustScoreBreakdown = {
  base: number
  ordersBonus: number
  noDisputeBonus: number
  disputeLossPenalty: number
  disputeWinPenalty: number
  ageBonus: number
  ratingBonus: number
  salesBonus: number
  verifiedBonus: number
  sellerDisputePenalty: number
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  const db = svc()

  const [profileRes, ordersRes, buyerDisputesRes, sellerDisputesRes] = await Promise.all([
    db.from('profiles').select('id, full_name, avatar_url, is_seller, seller_verified, rating, total_sales, created_at').eq('id', userId).single(),
    db.from('orders').select('id, status').eq('buyer_id', userId),
    db.from('order_disputes').select('id, status').eq('buyer_id', userId).catch(() => ({ data: [], error: null })),
    db.from('order_disputes').select('id, status').eq('seller_id', userId).catch(() => ({ data: [], error: null })),
  ])

  if (profileRes.error || !profileRes.data) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const profile = profileRes.data
  const orders = ordersRes.data ?? []
  const buyerDisputes = (buyerDisputesRes as { data: Array<{ id: string; status: string }> | null }).data ?? []
  const sellerDisputes = (sellerDisputesRes as { data: Array<{ id: string; status: string }> | null }).data ?? []

  const completedOrders = orders.filter(o => o.status === 'completed').length
  const accountAgeDays = Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))

  const buyerScore = computeBuyerScore({ completedOrders, buyerDisputes, accountAgeDays })
  const sellerScore = profile.is_seller
    ? computeSellerScore({
        rating: profile.rating ?? 0,
        totalSales: profile.total_sales ?? 0,
        sellerVerified: profile.seller_verified ?? false,
        sellerDisputes,
        accountAgeDays,
      })
    : null

  return NextResponse.json({
    userId,
    profile: {
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      is_seller: profile.is_seller,
      seller_verified: profile.seller_verified,
    },
    buyer: buyerScore,
    seller: sellerScore,
  })
}

function computeBuyerScore({
  completedOrders,
  buyerDisputes,
  accountAgeDays,
}: {
  completedOrders: number
  buyerDisputes: Array<{ id: string; status: string }>
  accountAgeDays: number
}) {
  const base = 60
  const ordersBonus = Math.min(completedOrders * 2, 20)
  const noDisputeBonus = buyerDisputes.length === 0 ? 10 : 0
  const disputeLossPenalty = buyerDisputes.filter(d => d.status === 'resolved_seller').length * 20
  const disputeWinPenalty = buyerDisputes.filter(d => d.status === 'resolved_buyer').length * 5
  const ageBonus = (accountAgeDays >= 180 ? 10 : accountAgeDays >= 90 ? 5 : 0)

  const score = Math.max(0, Math.min(100, base + ordersBonus + noDisputeBonus - disputeLossPenalty - disputeWinPenalty + ageBonus))

  const breakdown: Partial<TrustScoreBreakdown> = {
    base,
    ordersBonus,
    noDisputeBonus,
    disputeLossPenalty: -disputeLossPenalty,
    disputeWinPenalty: -disputeWinPenalty,
    ageBonus,
  }

  return { score, level: levelFor(score), label: labelFor(levelFor(score)), breakdown, totalDisputes: buyerDisputes.length, completedOrders }
}

function computeSellerScore({
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
}) {
  const base = 50
  const ratingBonus = Math.round((rating / 5) * 25)
  const salesBonus = Math.round(Math.min(totalSales, 20) / 20 * 15)
  const verifiedBonus = sellerVerified ? 10 : 0
  const sellerDisputePenalty = sellerDisputes.filter(d => d.status === 'resolved_buyer').length * 10
  const ageBonus = accountAgeDays >= 180 ? 10 : accountAgeDays >= 90 ? 5 : 0

  const score = Math.max(0, Math.min(100, base + ratingBonus + salesBonus + verifiedBonus - sellerDisputePenalty + ageBonus))

  const breakdown: Partial<TrustScoreBreakdown> = {
    base,
    ratingBonus,
    salesBonus,
    verifiedBonus,
    sellerDisputePenalty: -sellerDisputePenalty,
    ageBonus,
  }

  return { score, level: levelFor(score), label: labelFor(levelFor(score)), breakdown, totalSales, rating }
}

function levelFor(score: number): 'excellent' | 'good' | 'fair' | 'low' {
  if (score >= 85) return 'excellent'
  if (score >= 70) return 'good'
  if (score >= 50) return 'fair'
  return 'low'
}

function labelFor(level: string) {
  return { excellent: 'Excellent', good: 'Good', fair: 'Fair', low: 'Low' }[level] ?? 'Unknown'
}
