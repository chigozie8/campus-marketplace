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
  if (!supabase) return NextResponse.json({ cart: [] })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ cart: [] })

  const { data } = await supabase
    .from('cart_items')
    .select('id, product_id, quantity, added_at, products(id, title, price, images, stock_quantity, is_active, seller_id, profiles(full_name))')
    .eq('user_id', user.id)
    .order('added_at', { ascending: false })

  return NextResponse.json({ cart: data ?? [] })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { product_id, quantity = 1 } = await req.json()
  if (!product_id) return NextResponse.json({ error: 'product_id required' }, { status: 400 })

  const { data: product } = await supabase
    .from('products')
    .select('id, seller_id, stock_quantity, is_active')
    .eq('id', product_id)
    .single()

  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  if (!product.is_active) return NextResponse.json({ error: 'Product unavailable' }, { status: 400 })
  if (product.seller_id === user.id) return NextResponse.json({ error: 'Cannot add your own listing' }, { status: 400 })
  if (product.stock_quantity !== null && product.stock_quantity < 1) {
    return NextResponse.json({ error: 'Out of stock' }, { status: 400 })
  }

  const db = svc()
  const { data: existing } = await db
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', user.id)
    .eq('product_id', product_id)
    .single()

  if (existing) {
    const newQty = existing.quantity + quantity
    await db.from('cart_items').update({ quantity: newQty, reminder_sent: false }).eq('id', existing.id)
    return NextResponse.json({ added: true, quantity: newQty })
  }

  await db.from('cart_items').insert({ user_id: user.id, product_id, quantity, reminder_sent: false })
  return NextResponse.json({ added: true, quantity })
}

export async function DELETE(req: Request) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { product_id } = await req.json()

  const db = svc()
  if (product_id) {
    await db.from('cart_items').delete().eq('user_id', user.id).eq('product_id', product_id)
  } else {
    await db.from('cart_items').delete().eq('user_id', user.id)
  }

  return NextResponse.json({ removed: true })
}
