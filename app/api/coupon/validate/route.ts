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

  const { code, order_total } = await req.json()
  if (!code) return NextResponse.json({ error: 'code required' }, { status: 400 })

  const db = svc()
  const { data: coupon, error } = await db
    .from('coupon_codes')
    .select('*')
    .eq('code', code.trim().toUpperCase())
    .eq('is_active', true)
    .single()

  if (error || !coupon) {
    return NextResponse.json({ error: 'Invalid or expired coupon code' }, { status: 404 })
  }

  const now = new Date()
  if (coupon.valid_from && new Date(coupon.valid_from) > now) {
    return NextResponse.json({ error: 'This coupon is not active yet' }, { status: 400 })
  }
  if (coupon.valid_until && new Date(coupon.valid_until) < now) {
    return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 })
  }
  if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) {
    return NextResponse.json({ error: 'This coupon has reached its usage limit' }, { status: 400 })
  }
  if (order_total !== undefined && Number(order_total) < Number(coupon.min_order)) {
    return NextResponse.json({
      error: `Minimum order of ₦${Number(coupon.min_order).toLocaleString()} required for this coupon`,
    }, { status: 400 })
  }

  let discount = 0
  if (coupon.discount_type === 'percent') {
    discount = Math.round((Number(order_total ?? 0) * Number(coupon.discount_value)) / 100)
  } else {
    discount = Number(coupon.discount_value)
  }

  return NextResponse.json({
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      description: coupon.description,
    },
    discount,
  })
}
