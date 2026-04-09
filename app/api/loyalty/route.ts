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

export async function GET() {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ points: 0, transactions: [] })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ points: 0, transactions: [] })

  const db = svc()
  const [pointsRes, txRes] = await Promise.all([
    db.from('loyalty_points').select('total_points').eq('user_id', user.id).single(),
    db.from('loyalty_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
  ])

  return NextResponse.json({
    points: pointsRes.data?.total_points ?? 0,
    transactions: txRes.data ?? [],
  })
}
