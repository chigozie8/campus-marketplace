import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getBoostPrices(supabase: Awaited<ReturnType<typeof createClient>>) {
  if (!supabase) return { listingPrice: 150000, storePrice: 250000, durationDays: 7 }
  const { data: rows } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['boost_listing_price_kobo', 'boost_store_price_kobo', 'boost_duration_days'])
  const map: Record<string, string> = {}
  for (const r of rows ?? []) map[r.key] = r.value
  return {
    listingPrice: parseInt(map['boost_listing_price_kobo'] ?? '150000', 10),
    storePrice:   parseInt(map['boost_store_price_kobo']   ?? '250000', 10),
    durationDays: parseInt(map['boost_duration_days']       ?? '7',      10),
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { action, boostType = 'listing', productId } = body

    const paystackKey = process.env.PAYSTACK_SECRET_KEY
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5000'

    const { listingPrice, storePrice, durationDays } = await getBoostPrices(supabase)

    // ── INITIATE ──────────────────────────────────────────────
    if (action === 'initiate') {
      if (!paystackKey) return NextResponse.json({ error: 'Payment service not configured' }, { status: 503 })

      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', user.id)
        .single()

      const email = profile?.email || user.email

      if (boostType === 'store') {
        const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: { Authorization: `Bearer ${paystackKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            amount: storePrice,
            currency: 'NGN',
            callback_url: `${siteUrl}/api/boost/callback`,
            metadata: {
              boost_type: 'store',
              user_id: user.id,
              action: 'boost',
              duration_days: durationDays,
              custom_fields: [
                { display_name: 'Boost Type', variable_name: 'boost_type', value: 'Store Page' },
                { display_name: 'Seller',     variable_name: 'seller',     value: profile?.full_name || email },
                { display_name: 'Duration',   variable_name: 'duration',   value: `${durationDays} days` },
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

      // Default: listing boost
      const { data: product } = await supabase
        .from('products')
        .select('id, title, seller_id')
        .eq('id', productId)
        .eq('seller_id', user.id)
        .single()

      if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

      const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: { Authorization: `Bearer ${paystackKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          amount: listingPrice,
          currency: 'NGN',
          callback_url: `${siteUrl}/api/boost/callback`,
          metadata: {
            boost_type: 'listing',
            product_id: productId,
            user_id: user.id,
            action: 'boost',
            duration_days: durationDays,
            custom_fields: [
              { display_name: 'Product',  variable_name: 'product',  value: product.title },
              { display_name: 'Duration', variable_name: 'duration', value: `${durationDays} days` },
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

    // ── ACTIVATE ──────────────────────────────────────────────
    if (action === 'activate') {
      const { reference } = body
      if (!paystackKey) return NextResponse.json({ error: 'Payment service not configured' }, { status: 503 })

      const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${paystackKey}` },
      })
      const verifyData = await verifyRes.json()

      if (!verifyData.status || verifyData.data?.status !== 'success') {
        return NextResponse.json({ error: 'Payment not confirmed' }, { status: 400 })
      }

      const meta = verifyData.data?.metadata
      // Use duration stored in payment metadata so old transactions honour the price they paid for
      const days = meta?.duration_days ?? durationDays
      const boostExpires = new Date()
      boostExpires.setDate(boostExpires.getDate() + days)
      const expiresIso = boostExpires.toISOString()

      if (meta?.boost_type === 'store' || boostType === 'store') {
        const admin = adminClient()

        await admin.auth.admin.updateUserById(user.id, {
          user_metadata: {
            ...user.user_metadata,
            store_boost_expires_at: expiresIso,
          },
        })

        await supabase
          .from('profiles')
          .update({ store_boost_expires_at: expiresIso } as Record<string, string>)
          .eq('id', user.id)

        return NextResponse.json({ success: true, expiresAt: expiresIso, boostType: 'store' })
      }

      const pid = meta?.product_id || productId
      if (!pid) return NextResponse.json({ error: 'No product ID in metadata' }, { status: 400 })

      const { error: updateError } = await supabase
        .from('products')
        .update({ is_featured: true, boost_expires_at: expiresIso })
        .eq('id', pid)
        .eq('seller_id', user.id)

      if (updateError && !updateError.message.includes('column')) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, expiresAt: expiresIso, boostType: 'listing' })
    }

    // ── VERIFY STATUS ─────────────────────────────────────────
    if (action === 'verify') {
      if (boostType === 'store') {
        const expiresAt = user.user_metadata?.store_boost_expires_at as string | undefined
        const isActive = !!expiresAt && new Date(expiresAt) > new Date()
        return NextResponse.json({ isActive, expiresAt, boostPriceKobo: storePrice, durationDays })
      }

      const { data: product } = await supabase
        .from('products')
        .select('id, title, seller_id, is_featured, boost_expires_at')
        .eq('id', productId)
        .eq('seller_id', user.id)
        .single()

      if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

      const isActive = product.boost_expires_at && new Date(product.boost_expires_at) > new Date()
      return NextResponse.json({ product, isActive, boostPriceKobo: listingPrice, durationDays })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
