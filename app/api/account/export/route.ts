import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function GET() {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userId = user.id

    const [profileRes, productsRes, ordersRes, reviewsRes, notifRes] = await Promise.all([
      adminDb.from('profiles').select('*').eq('id', userId).single(),
      adminDb.from('products').select('id, title, price, status, created_at').eq('seller_id', userId),
      adminDb.from('orders').select('id, status, total_amount, created_at').or(`buyer_id.eq.${userId},seller_id.eq.${userId}`),
      adminDb.from('reviews').select('id, rating, comment, created_at').eq('reviewer_id', userId),
      adminDb.from('notifications').select('id, type, title, body, created_at').eq('user_id', userId).limit(200),
    ])

    const exportData = {
      exported_at: new Date().toISOString(),
      account: {
        id: userId,
        email: user.email,
        created_at: user.created_at,
      },
      profile: profileRes.data ?? null,
      listings: productsRes.data ?? [],
      orders: ordersRes.data ?? [],
      reviews: reviewsRes.data ?? [],
      notifications: notifRes.data ?? [],
    }

    const json = JSON.stringify(exportData, null, 2)

    return new NextResponse(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="vendoorx-data-${userId.slice(0, 8)}.json"`,
      },
    })
  } catch (err) {
    console.error('[account/export]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
