import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BOOST_PRICE_NGN = 150000

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { productId, action } = await req.json()

    if (action === 'verify') {
      const { data: product } = await supabase
        .from('products')
        .select('id, title, seller_id, is_featured, boost_expires_at')
        .eq('id', productId)
        .eq('seller_id', user.id)
        .single()

      if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

      const isActive = product.boost_expires_at && new Date(product.boost_expires_at) > new Date()
      return NextResponse.json({ product, isActive, boostPriceKobo: BOOST_PRICE_NGN })
    }

    if (action === 'initiate') {
      const { data: product } = await supabase
        .from('products')
        .select('id, title, seller_id')
        .eq('id', productId)
        .eq('seller_id', user.id)
        .single()

      if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

      const paystackKey = process.env.PAYSTACK_SECRET_KEY
      if (!paystackKey) {
        return NextResponse.json({ error: 'Payment service not configured' }, { status: 503 })
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single()

      const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/boost/callback`

      const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paystackKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: profile?.email || user.email,
          amount: BOOST_PRICE_NGN,
          currency: 'NGN',
          callback_url: callbackUrl,
          metadata: {
            product_id: productId,
            user_id: user.id,
            action: 'boost',
            custom_fields: [
              { display_name: 'Product', variable_name: 'product', value: product.title },
              { display_name: 'Boost Duration', variable_name: 'duration', value: '7 days' },
            ],
          },
        }),
      })

      const paystackData = await paystackRes.json()
      if (!paystackData.status) {
        return NextResponse.json({ error: paystackData.message || 'Payment init failed' }, { status: 500 })
      }

      return NextResponse.json({
        authorizationUrl: paystackData.data.authorization_url,
        reference: paystackData.data.reference,
      })
    }

    if (action === 'activate') {
      const { reference } = await req.json().catch(() => ({ reference: null }))
      const paystackKey = process.env.PAYSTACK_SECRET_KEY
      if (!paystackKey) return NextResponse.json({ error: 'Payment service not configured' }, { status: 503 })

      const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${paystackKey}` },
      })
      const verifyData = await verifyRes.json()

      if (!verifyData.status || verifyData.data?.status !== 'success') {
        return NextResponse.json({ error: 'Payment not confirmed' }, { status: 400 })
      }

      const meta = verifyData.data?.metadata
      const pid = meta?.product_id || productId

      const boostExpires = new Date()
      boostExpires.setDate(boostExpires.getDate() + 7)

      const { error: updateError } = await supabase
        .from('products')
        .update({ is_featured: true, boost_expires_at: boostExpires.toISOString() })
        .eq('id', pid)
        .eq('seller_id', user.id)

      if (updateError && !updateError.message.includes('column')) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, expiresAt: boostExpires.toISOString() })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
