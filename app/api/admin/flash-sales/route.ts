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
    .from('flash_sales')
    .select('*, products(id, title, price, images)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ sales: data ?? [] })
}

export async function POST(req: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { product_id, sale_price, start_at, end_at } = await req.json()

  if (!product_id || !sale_price || !start_at || !end_at) {
    return NextResponse.json({ error: 'product_id, sale_price, start_at, end_at required' }, { status: 400 })
  }

  const { data: product } = await svc().from('products').select('id, price').eq('id', product_id).single()
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  if (Number(sale_price) >= Number(product.price)) {
    return NextResponse.json({ error: 'Sale price must be less than original price' }, { status: 400 })
  }

  const { data, error } = await svc()
    .from('flash_sales')
    .upsert({
      product_id,
      sale_price: Number(sale_price),
      start_at,
      end_at,
      is_active: true,
      created_by: admin.id,
    }, { onConflict: 'product_id' })
    .select('*, products(id, title, price, images)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify users who wishlisted this product
  const { data: wishers } = await svc()
    .from('favorites')
    .select('user_id')
    .eq('product_id', product_id)

  for (const w of wishers ?? []) {
    await svc().from('notifications').insert({
      user_id: w.user_id,
      type: 'flash_sale',
      title: '⚡ Flash Sale!',
      body: `A product on your wishlist "${product.price ? `₦${Number(product.price).toLocaleString()}` : ''}" is now on flash sale for ₦${Number(sale_price).toLocaleString()}!`,
      read: false,
    }).catch(() => {})
  }

  return NextResponse.json({ sale: data }, { status: 201 })
}
