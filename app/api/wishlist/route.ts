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
  if (!supabase) return NextResponse.json({ wishlist: [] })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ wishlist: [] })

  const { data } = await supabase
    .from('favorites')
    .select('id, product_id, last_seen_price, added_at, products(id, title, price, images, stock_quantity, is_active, seller_id, profiles(full_name, avatar_url))')
    .eq('user_id', user.id)
    .order('added_at', { ascending: false })

  return NextResponse.json({ wishlist: data ?? [] })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { product_id } = await req.json()
  if (!product_id) return NextResponse.json({ error: 'product_id required' }, { status: 400 })

  const { data: product } = await supabase
    .from('products')
    .select('id, price')
    .eq('id', product_id)
    .single()

  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  const db = svc()
  const { data: existing } = await db
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', product_id)
    .single()

  if (existing) {
    await db.from('favorites').delete().eq('id', existing.id)
    return NextResponse.json({ saved: false })
  }

  await db.from('favorites').insert({
    user_id: user.id,
    product_id,
    last_seen_price: product.price,
    added_at: new Date().toISOString(),
  })

  // Also remove from restock waitlist if re-saving (product back in stock)
  await db.from('restock_waitlist').delete().eq('user_id', user.id).eq('product_id', product_id)

  return NextResponse.json({ saved: true })
}
