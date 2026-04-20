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

export async function GET(req: Request) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const role = url.searchParams.get('role') || 'all'

  let query = svc()
    .from('order_disputes')
    .select(`
      id, order_id, buyer_id, seller_id, reason, evidence, status,
      admin_note, resolved_at, created_at, amount,
      orders(id, total_amount, status, products(id, title, images))
    `)
    .order('created_at', { ascending: false })

  if (role === 'buyer') query = query.eq('buyer_id', user.id)
  else if (role === 'seller') query = query.eq('seller_id', user.id)
  else query = query.or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ disputes: data ?? [], me: user.id })
}
