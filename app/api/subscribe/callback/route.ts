import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const reference = searchParams.get('reference') || searchParams.get('trxref')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5000'

  if (!reference) {
    return NextResponse.redirect(`${siteUrl}/dashboard?subscription=failed`)
  }

  const paystackKey = process.env.PAYSTACK_SECRET_KEY
  if (!paystackKey) {
    return NextResponse.redirect(`${siteUrl}/dashboard?subscription=failed`)
  }

  try {
    // Verify with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${paystackKey}` },
    })
    const verifyData = await verifyRes.json()

    const admin = createServiceClient()
    if (!admin) {
      return NextResponse.redirect(`${siteUrl}/dashboard?subscription=failed`)
    }

    if (!verifyData.status || verifyData.data?.status !== 'success') {
      // Mark pending subscription as cancelled
      await admin
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('payment_ref', reference)
        .eq('status', 'pending')

      return NextResponse.redirect(`${siteUrl}/dashboard?subscription=failed`)
    }

    const meta = verifyData.data?.metadata
    const planId: string = meta?.plan_id
    const billingCycle: 'monthly' | 'annual' = meta?.billing_cycle || 'monthly'
    const userId: string = meta?.user_id

    if (!planId || !userId) {
      return NextResponse.redirect(`${siteUrl}/dashboard?subscription=failed`)
    }

    // Calculate expiry: monthly = 30 days, annual = 365 days
    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setDate(expiresAt.getDate() + (billingCycle === 'annual' ? 365 : 30))

    // Cancel any previously active subscription for this user (plan switch)
    await admin
      .from('subscriptions')
      .update({ status: 'cancelled', updated_at: now.toISOString() })
      .eq('user_id', userId)
      .eq('status', 'active')
      .neq('payment_ref', reference)

    // Activate the matching pending row
    const { error } = await admin
      .from('subscriptions')
      .update({
        status: 'active',
        started_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('payment_ref', reference)
      .eq('status', 'pending')

    if (error) {
      console.error('[subscribe/callback] DB update error:', error.message)
      return NextResponse.redirect(`${siteUrl}/dashboard?subscription=failed`)
    }

    return NextResponse.redirect(`${siteUrl}/dashboard?subscription=success&plan=${planId}`)
  } catch (err) {
    console.error('[subscribe/callback] unexpected error:', err)
    return NextResponse.redirect(`${siteUrl}/dashboard?subscription=failed`)
  }
}
