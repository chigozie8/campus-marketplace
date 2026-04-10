import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { sendNotification } from '@/lib/send-notification'

function db() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { product_id, quantity = 1, delivery_address } = body

    if (!product_id || !delivery_address?.trim()) {
      return NextResponse.json({ success: false, message: 'product_id and delivery_address are required' }, { status: 400 })
    }
    if (quantity < 1) {
      return NextResponse.json({ success: false, message: 'Quantity must be at least 1' }, { status: 400 })
    }

    const admin = db()

    const { data: product, error: productErr } = await admin
      .from('products')
      .select('id, title, price, seller_id, is_available, delivery_fee')
      .eq('id', product_id)
      .single()

    if (productErr || !product) {
      const msg = productErr?.message ?? 'Product not found'
      return NextResponse.json({ success: false, message: msg }, { status: 404 })
    }
    if (product.is_available === false) {
      return NextResponse.json({ success: false, message: 'This item is no longer available' }, { status: 400 })
    }
    if (product.seller_id === user.id) {
      return NextResponse.json({ success: false, message: 'You cannot buy your own listing' }, { status: 400 })
    }

    const itemTotal = product.price * quantity
    const deliveryFee = Number(product.delivery_fee ?? 0)

    // Read the platform fee from site_settings (falls back to ₦100)
    const { data: feeRows } = await admin
      .from('site_settings')
      .select('key, value')
      .in('key', ['platform_fee_amount'])
    const feeMap = Object.fromEntries((feeRows ?? []).map((r: { key: string; value: string }) => [r.key, r.value]))
    const platformFee = Math.max(0, Number(feeMap.platform_fee_amount ?? '100'))

    const totalAmount = itemTotal + deliveryFee + platformFee

    const { data: order, error: orderErr } = await admin
      .from('orders')
      .insert({
        buyer_id: user.id,
        product_id,
        seller_id: product.seller_id,
        quantity,
        total_amount: totalAmount,
        delivery_fee: deliveryFee,
        platform_fee: platformFee,
        delivery_address: delivery_address.trim(),
        status: 'pending',
      })
      .select()
      .single()

    if (orderErr || !order) {
      return NextResponse.json({ success: false, message: orderErr?.message ?? 'Failed to create order' }, { status: 500 })
    }

    sendNotification({
      userId: product.seller_id,
      type: 'new_order',
      title: 'New Order Received',
      body: `You have a new order for "${product.title}" ×${quantity}`,
      data: { url: '/seller-orders', orderId: order.id },
    }).catch(() => {})

    sendNotification({
      userId: user.id,
      type: 'new_order',
      title: 'Order Placed',
      body: `Your order for "${product.title}" is placed. Complete payment to confirm.`,
      data: { url: '/dashboard/orders', orderId: order.id },
    }).catch(() => {})

    return NextResponse.json({ success: true, data: { ...order, product } })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}
