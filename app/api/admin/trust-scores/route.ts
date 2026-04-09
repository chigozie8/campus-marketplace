import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { computeBuyerScore, computeSellerScore } from '@/lib/trust'

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
  const { data } = await svc().from('admin_roles').select('role').eq('user_id', user.id).single()
  return data ? user : null
}

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = svc()

  const [profilesRes, ordersRes, disputesRes] = await Promise.all([
    db.from('profiles')
      .select('id, full_name, avatar_url, is_seller, seller_verified, rating, total_sales, created_at, is_flagged, flag_reason, flagged_at, admin_badges, trust_score_override, score_override_note')
      .order('created_at', { ascending: false }),
    db.from('orders').select('id, buyer_id, status'),
    db.from('order_disputes').select('id, buyer_id, seller_id, status').then(r => r, () => ({ data: [] as Array<{ id: string; buyer_id: string; seller_id: string; status: string }> | null, error: null })),
  ])

  let profiles = profilesRes.data ?? []
  const columnsSetupNeeded = !!profilesRes.error && profilesRes.error.message?.includes('does not exist')

  if (columnsSetupNeeded) {
    const fallback = await db.from('profiles')
      .select('id, full_name, avatar_url, is_seller, seller_verified, rating, total_sales, created_at')
      .order('created_at', { ascending: false })
    profiles = fallback.data ?? []
  }

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
    const completedOrders = userOrders.filter(o => o.status === 'completed').length
    const accountAgeDays = Math.floor((Date.now() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24))

    const { score: buyerScore, level: buyerLevel } = computeBuyerScore({
      completedOrders,
      buyerDisputes,
      accountAgeDays,
    })

    let sellerScore: number | null = null
    let sellerLevel: string | null = null
    if (p.is_seller) {
      const s = computeSellerScore({
        rating: p.rating ?? 0,
        totalSales: p.total_sales ?? 0,
        sellerVerified: p.seller_verified ?? false,
        sellerDisputes,
        accountAgeDays,
      })
      sellerScore = s.score
      sellerLevel = s.level
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
      buyerLevel,
      sellerScore,
      sellerLevel,
      completedOrders,
      totalBuyerDisputes: buyerDisputes.length,
      totalSellerDisputes: sellerDisputes.length,
      is_flagged: (p as Record<string, unknown>).is_flagged ?? false,
      flag_reason: (p as Record<string, unknown>).flag_reason ?? null,
      flagged_at: (p as Record<string, unknown>).flagged_at ?? null,
      admin_badges: (p as Record<string, unknown>).admin_badges ?? [],
      trust_score_override: (p as Record<string, unknown>).trust_score_override ?? null,
      score_override_note: (p as Record<string, unknown>).score_override_note ?? null,
    }
  })

  return NextResponse.json({ users: result, setup_needed: columnsSetupNeeded })
}
