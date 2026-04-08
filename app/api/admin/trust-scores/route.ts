import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

function svc() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

async function requireAdmin() {
  const supabase = await createClient()
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('admin_roles').select('role').eq('user_id', user.id).single()
  return data ? user : null
}

function levelFor(score: number) {
  if (score >= 85) return 'excellent'
  if (score >= 70) return 'good'
  if (score >= 50) return 'fair'
  return 'low'
}

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = svc()

  const [profilesRes, ordersRes, disputesRes] = await Promise.all([
    db.from('profiles').select('id, full_name, avatar_url, is_seller, seller_verified, rating, total_sales, created_at').order('created_at', { ascending: false }),
    db.from('orders').select('id, buyer_id, status'),
    db.from('order_disputes').select('id, buyer_id, seller_id, status').catch(() => ({ data: [], error: null })),
  ])

  const profiles = profilesRes.data ?? []
  const orders = ordersRes.data ?? []
  const disputes = (disputesRes as { data: Array<{ id: string; buyer_id: string; seller_id: string; status: string }> | null }).data ?? []

  const ordersByBuyer: Record<string, typeof orders> = {}
  for (const o of orders) {
    if (!ordersByBuyer[o.buyer_id]) ordersByBuyer[o.buyer_id] = []
    ordersByBuyer[o.buyer_id].push(o)
  }

  const disputesByBuyer: Record<string, typeof disputes> = {}
  const disputesBySeller: Record<string, typeof disputes> = {}
  for (const d of disputes) {
    if (!disputesByBuyer[d.buyer_id]) disputesByBuyer[d.buyer_id] = []
    disputesByBuyer[d.buyer_id].push(d)
    if (!disputesBySeller[d.seller_id]) disputesBySeller[d.seller_id] = []
    disputesBySeller[d.seller_id].push(d)
  }

  const result = profiles.map(p => {
    const userOrders = ordersByBuyer[p.id] ?? []
    const buyerDisputes = disputesByBuyer[p.id] ?? []
    const sellerDisputes = disputesBySeller[p.id] ?? []
    const accountAgeDays = Math.floor((Date.now() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24))
    const completedOrders = userOrders.filter(o => o.status === 'completed').length

    const base = 60
    const ordersBonus = Math.min(completedOrders * 2, 20)
    const noDisputeBonus = buyerDisputes.length === 0 ? 10 : 0
    const disputeLossPenalty = buyerDisputes.filter(d => d.status === 'resolved_seller').length * 20
    const disputeWinPenalty = buyerDisputes.filter(d => d.status === 'resolved_buyer').length * 5
    const ageBonus = accountAgeDays >= 180 ? 10 : accountAgeDays >= 90 ? 5 : 0
    const buyerScore = Math.max(0, Math.min(100, base + ordersBonus + noDisputeBonus - disputeLossPenalty - disputeWinPenalty + ageBonus))

    let sellerScore: number | null = null
    if (p.is_seller) {
      const sBase = 50
      const ratingBonus = Math.round(((p.rating ?? 0) / 5) * 25)
      const salesBonus = Math.round(Math.min(p.total_sales ?? 0, 20) / 20 * 15)
      const verifiedBonus = p.seller_verified ? 10 : 0
      const sellerDisputePenalty = sellerDisputes.filter(d => d.status === 'resolved_buyer').length * 10
      const sAgeBonus = ageBonus
      sellerScore = Math.max(0, Math.min(100, sBase + ratingBonus + salesBonus + verifiedBonus - sellerDisputePenalty + sAgeBonus))
    }

    return {
      id: p.id,
      full_name: p.full_name,
      avatar_url: p.avatar_url,
      is_seller: p.is_seller,
      seller_verified: p.seller_verified,
      rating: p.rating,
      total_sales: p.total_sales,
      created_at: p.created_at,
      buyerScore,
      buyerLevel: levelFor(buyerScore),
      sellerScore,
      sellerLevel: sellerScore !== null ? levelFor(sellerScore) : null,
      completedOrders,
      totalBuyerDisputes: buyerDisputes.length,
      totalSellerDisputes: sellerDisputes.length,
    }
  })

  return NextResponse.json({ users: result })
}
