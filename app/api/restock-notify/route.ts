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

export async function POST(req: Request) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { product_id } = await req.json()
  if (!product_id) return NextResponse.json({ error: 'product_id required' }, { status: 400 })

  const db = svc()

  const { data: existing } = await db
    .from('restock_waitlist')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', product_id)
    .single()

  if (existing) {
    await db.from('restock_waitlist').delete().eq('id', existing.id)
    return NextResponse.json({ subscribed: false })
  }

  await db.from('restock_waitlist').insert({ user_id: user.id, product_id, notified: false })
  return NextResponse.json({ subscribed: true })
}

export async function GET(req: Request) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ subscribed: [] })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ subscribed: [] })

  const { data } = await supabase
    .from('restock_waitlist')
    .select('product_id')
    .eq('user_id', user.id)
    .eq('notified', false)

  return NextResponse.json({ subscribed: (data ?? []).map(r => r.product_id) })
}
