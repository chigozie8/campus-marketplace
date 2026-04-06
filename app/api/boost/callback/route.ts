import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const reference = searchParams.get('reference') || searchParams.get('trxref')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5000'

  if (!reference) {
    return NextResponse.redirect(`${siteUrl}/dashboard?boost=failed&reason=no_reference`)
  }

  const paystackKey = process.env.PAYSTACK_SECRET_KEY
  if (!paystackKey) {
    return NextResponse.redirect(`${siteUrl}/dashboard?boost=failed&reason=config`)
  }

  try {
    // Verify transaction with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${paystackKey}` },
    })
    const verifyData = await verifyRes.json()

    if (!verifyData.status || verifyData.data?.status !== 'success') {
      return NextResponse.redirect(`${siteUrl}/dashboard?boost=failed&reason=payment_not_confirmed`)
    }

    const meta = verifyData.data?.metadata
    const boostType = meta?.boost_type || 'listing'
    const userId = meta?.user_id
    const productId = meta?.product_id

    if (!userId) {
      return NextResponse.redirect(`${siteUrl}/dashboard?boost=failed&reason=no_user`)
    }

    const boostExpires = new Date()
    boostExpires.setDate(boostExpires.getDate() + 7)
    const expiresIso = boostExpires.toISOString()

    const supabase = await createClient()
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    if (boostType === 'store') {
      // Get current user metadata to merge
      const { data: { user } } = await admin.auth.admin.getUserById(userId)

      await admin.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...(user?.user_metadata ?? {}),
          store_boost_expires_at: expiresIso,
        },
      })

      // Also try profiles table (works after migration 009)
      if (supabase) {
        await supabase
          .from('profiles')
          .update({ store_boost_expires_at: expiresIso } as Record<string, string>)
          .eq('id', userId)
      }

      return NextResponse.redirect(`${siteUrl}/dashboard?boost=success&type=store`)
    }

    // Listing boost
    if (!productId) {
      return NextResponse.redirect(`${siteUrl}/dashboard?boost=failed&reason=no_product`)
    }

    if (!supabase) {
      return NextResponse.redirect(`${siteUrl}/dashboard?boost=failed&reason=service_unavailable`)
    }

    const { error } = await supabase
      .from('products')
      .update({ is_featured: true, boost_expires_at: expiresIso })
      .eq('id', productId)
      .eq('seller_id', userId)

    if (error && !error.message.includes('column')) {
      return NextResponse.redirect(`${siteUrl}/dashboard?boost=failed&reason=db_error`)
    }

    return NextResponse.redirect(`${siteUrl}/dashboard?boost=success&type=listing`)
  } catch {
    return NextResponse.redirect(`${siteUrl}/dashboard?boost=failed&reason=server_error`)
  }
}
