import { NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { computeBuyerScore, computeSellerScore } from '@/lib/trust'

function svc() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export type { TrustScoreBreakdown } from '@/lib/trust'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  const db = svc()

  // Determine the requesting user so we can decide what to return
  const supabase = await createClient()
  const requestingUser = supabase
    ? (await supabase.auth.getUser()).data.user
    : null

  const isSelf = requestingUser?.id === userId

  // Check if the requesting user is an admin via canonical admin_roles table
  let isAdmin = false
  if (!isSelf && requestingUser) {
    const { data: adminRow } = await db
      .from('admin_roles')
      .select('role')
      .eq('user_id', requestingUser.id)
      .maybeSingle()
    isAdmin = !!adminRow
  }

  const [profileRes, ordersRes, buyerDisputesRes, sellerDisputesRes] = await Promise.all([
    db.from('profiles').select('id, full_name, avatar_url, is_seller, seller_verified, rating, total_sales, created_at').eq('id', userId).single(),
    db.from('orders').select('id, status').eq('buyer_id', userId),
    db.from('order_disputes').select('id, status').eq('buyer_id', userId).then(r => r, () => ({ data: [] as Array<{ id: string; status: string }>, error: null })),
    db.from('order_disputes').select('id, status').eq('seller_id', userId).then(r => r, () => ({ data: [] as Array<{ id: string; status: string }>, error: null })),
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

  // Full breakdown is only returned to the user themselves or an admin
  if (isSelf || isAdmin) {
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

  // Public-safe response: score + tier only, no dispute/order counts
  return NextResponse.json({
    userId,
    profile: {
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      is_seller: profile.is_seller,
      seller_verified: profile.seller_verified,
    },
    buyer: { score: buyerScore.score, level: buyerScore.level, label: buyerScore.label },
    seller: sellerScore ? { score: sellerScore.score, level: sellerScore.level, label: sellerScore.label } : null,
  })
}
