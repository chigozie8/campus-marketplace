import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { productId, offerPrice, message } = await req.json()
    if (!productId || !offerPrice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: product } = await supabase
      .from('products')
      .select('id, title, price, seller_id, profiles(full_name)')
      .eq('id', productId)
      .single()

    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    if (product.seller_id === user.id) {
      return NextResponse.json({ error: 'Cannot offer on your own listing' }, { status: 400 })
    }
    if (offerPrice >= product.price) {
      return NextResponse.json({ error: 'Offer must be less than listing price' }, { status: 400 })
    }

    const { data: buyerProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const { error: insertError } = await supabase.from('offers').insert({
      product_id: productId,
      buyer_id: user.id,
      seller_id: product.seller_id,
      offer_price: offerPrice,
      message: message || null,
      status: 'pending',
    })

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    const buyerName = buyerProfile?.full_name || 'A buyer'
    const discount = Math.round(((product.price - offerPrice) / product.price) * 100)
    const notifBody = `${buyerName} offered ₦${Number(offerPrice).toLocaleString()} (${discount}% off) for "${product.title}"${message ? `: "${message}"` : ''}`

    try {
      await supabase.from('notifications').insert({
        user_id: product.seller_id,
        title: 'New Offer Received',
        body: notifBody,
        type: 'offer',
        data: { url: '/dashboard', productId, offerPrice, buyerId: user.id },
      })
    } catch { /* non-critical */ }

    return NextResponse.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'received'

    const field = type === 'sent' ? 'buyer_id' : 'seller_id'
    const { data: offers, error } = await supabase
      .from('offers')
      .select('*, products(id, title, images, price), profiles!offers_buyer_id_fkey(full_name)')
      .eq(field, user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ offers: offers || [] })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
