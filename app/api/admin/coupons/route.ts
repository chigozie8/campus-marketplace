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
  const { data } = await svc().from('admin_roles').select('role').eq('user_id', user.id).single()
  return data ? user : null
}

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await svc()
    .from('coupon_codes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    const missingTable =
      error.code === 'PGRST200' ||
      error.code === 'PGRST205' ||
      error.message?.toLowerCase().includes('does not exist') ||
      error.message?.toLowerCase().includes('schema cache')
    if (missingTable) return NextResponse.json({ coupons: [], setup_needed: true })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ coupons: data ?? [] })
}

export async function POST(req: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { code, description, discount_type, discount_value, min_order, max_uses, valid_from, valid_until } = body

  if (!code || !discount_type || !discount_value) {
    return NextResponse.json({ error: 'code, discount_type, and discount_value required' }, { status: 400 })
  }
  if (!['percent', 'fixed'].includes(discount_type)) {
    return NextResponse.json({ error: 'discount_type must be percent or fixed' }, { status: 400 })
  }

  const { data, error } = await svc()
    .from('coupon_codes')
    .insert({
      code: code.trim().toUpperCase(),
      description: description ?? null,
      discount_type,
      discount_value: Number(discount_value),
      min_order: Number(min_order ?? 0),
      max_uses: max_uses ? Number(max_uses) : null,
      valid_from: valid_from ?? null,
      valid_until: valid_until ?? null,
      is_active: true,
      created_by: admin.id,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ coupon: data }, { status: 201 })
}
