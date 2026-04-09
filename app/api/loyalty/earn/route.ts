import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

function svc() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

// Internal endpoint — called by order completion logic
// Protected by internal API key
export async function POST(req: NextRequest) {
  const key = req.headers.get('x-internal-key')
  if (key !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { user_id, points, description, order_id } = await req.json()
  if (!user_id || !points) {
    return NextResponse.json({ error: 'user_id and points required' }, { status: 400 })
  }

  const db = svc()

  // Insert transaction
  await db.from('loyalty_transactions').insert({
    user_id,
    points: Number(points),
    type: 'earn',
    description: description ?? `Earned ${points} points`,
    order_id: order_id ?? null,
  })

  // Upsert total
  const { data: existing } = await db
    .from('loyalty_points')
    .select('total_points')
    .eq('user_id', user_id)
    .single()

  if (existing) {
    await db.from('loyalty_points').update({
      total_points: existing.total_points + Number(points),
      updated_at: new Date().toISOString(),
    }).eq('user_id', user_id)
  } else {
    await db.from('loyalty_points').insert({
      user_id,
      total_points: Number(points),
    })
  }

  // Notify user
  await db.from('notifications').insert({
    user_id,
    type: 'loyalty',
    title: '🎁 Points Earned!',
    body: `You earned ${points} loyalty point${Number(points) !== 1 ? 's' : ''} on your recent order.`,
    read: false,
  }).catch(() => {})

  return NextResponse.json({ ok: true })
}
