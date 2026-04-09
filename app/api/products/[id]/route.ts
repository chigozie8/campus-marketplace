import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

const LOW_STOCK_THRESHOLD = 5

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const { userId } = await req.json().catch(() => ({}))

  if (!id) return NextResponse.json({ error: 'Missing product id' }, { status: 400 })
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = serviceClient()

  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('id, seller_id, images')
    .eq('id', id)
    .single()

  if (fetchError || !product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  if (product.seller_id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase.from('products').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const { userId, ...updates } = body

  if (!id) return NextResponse.json({ error: 'Missing product id' }, { status: 400 })
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = serviceClient()

  const { data: oldProduct, error: fetchError } = await supabase
    .from('products')
    .select('id, seller_id, price, stock_quantity, title')
    .eq('id', id)
    .single()

  if (fetchError || !oldProduct) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  if (oldProduct.seller_id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // ── Price drop alert ──────────────────────────────────────────
  const newPrice = updates.price !== undefined ? Number(updates.price) : null
  const oldPrice = Number(oldProduct.price)
  if (newPrice !== null && newPrice < oldPrice) {
    const { data: wishers } = await supabase
      .from('favorites')
      .select('user_id, last_seen_price')
      .eq('product_id', id)

    for (const w of wishers ?? []) {
      const userLastPrice = w.last_seen_price ?? oldPrice
      if (newPrice < userLastPrice) {
        await supabase.from('notifications').insert({
          user_id: w.user_id,
          type: 'price_drop',
          title: '📉 Price Drop on Your Wishlist!',
          body: `"${oldProduct.title}" dropped from ₦${userLastPrice.toLocaleString()} to ₦${newPrice.toLocaleString()}!`,
          read: false,
        }).catch(() => {})

        // Update last seen price
        await supabase
          .from('favorites')
          .update({ last_seen_price: newPrice })
          .eq('user_id', w.user_id)
          .eq('product_id', id)
          .catch(() => {})
      }
    }
  }

  // ── Low stock alert to seller ─────────────────────────────────
  const newStock = updates.stock_quantity !== undefined ? Number(updates.stock_quantity) : null
  const oldStock = oldProduct.stock_quantity !== null ? Number(oldProduct.stock_quantity) : null
  if (newStock !== null && newStock <= LOW_STOCK_THRESHOLD && (oldStock === null || oldStock > LOW_STOCK_THRESHOLD)) {
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'low_stock',
      title: '⚠️ Low Stock Alert',
      body: `"${oldProduct.title}" only has ${newStock} unit${newStock !== 1 ? 's' : ''} left. Restock soon to avoid missing sales!`,
      read: false,
    }).catch(() => {})
  }

  // ── Restock notifications to waitlist ─────────────────────────
  if (newStock !== null && newStock > 0 && (oldStock !== null && oldStock <= 0)) {
    const { data: waitlist } = await supabase
      .from('restock_waitlist')
      .select('user_id')
      .eq('product_id', id)
      .eq('notified', false)

    for (const w of waitlist ?? []) {
      await supabase.from('notifications').insert({
        user_id: w.user_id,
        type: 'restock',
        title: '🔔 Back in Stock!',
        body: `"${oldProduct.title}" is back in stock. Grab it before it sells out again!`,
        read: false,
      }).catch(() => {})
    }

    if (waitlist && waitlist.length > 0) {
      await supabase
        .from('restock_waitlist')
        .update({ notified: true })
        .eq('product_id', id)
        .catch(() => {})
    }
  }

  return NextResponse.json({ product: data })
}
