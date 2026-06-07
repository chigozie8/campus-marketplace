import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { planId, billingCycle } = body as { planId: string; billingCycle: 'monthly' | 'annual' }

    if (!planId || !billingCycle) {
      return NextResponse.json({ error: 'planId and billingCycle are required' }, { status: 400 })
    }

    // Starter plan is free — no payment needed, just upsert active subscription
    if (planId === 'starter') {
      const admin = createServiceClient()
      if (!admin) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

      const now = new Date().toISOString()
      // Cancel any existing paid subscription rows for this user
      await admin
        .from('subscriptions')
        .update({ status: 'cancelled', updated_at: now })
        .eq('user_id', user.id)
        .in('status', ['active', 'pending'])
        .neq('plan_id', 'starter')

      // Upsert starter subscription (no expiry)
      const { error } = await admin
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          plan_id: 'starter',
          billing_cycle: billingCycle,
          status: 'active',
          started_at: now,
          expires_at: null,
          updated_at: now,
        }, { onConflict: 'user_id,plan_id' })

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ free: true })
    }

    // Paid plan — look up price from DB
    const { data: plan, error: planErr } = await supabase
      .from('pricing_plans')
      .select('id, name, monthly_price, annual_price')
      .eq('id', planId)
      .eq('is_active', true)
      .single()

    if (planErr || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    const amountKobo = billingCycle === 'annual' ? plan.annual_price * 100 : plan.monthly_price * 100

    if (amountKobo <= 0) {
      return NextResponse.json({ error: 'Invalid plan price' }, { status: 400 })
    }

    const paystackKey = process.env.PAYSTACK_SECRET_KEY
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5000'

    if (!paystackKey) {
      return NextResponse.json({ error: 'Payment service not configured' }, { status: 503 })
    }

    // Fetch user email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single()

    const email = profile?.email || user.email

    // Create a pending subscription row so we can track the reference
    const admin = createServiceClient()
    if (!admin) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

    const { data: subRow, error: subErr } = await admin
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan_id: planId,
        billing_cycle: billingCycle,
        status: 'pending',
        amount_kobo: amountKobo,
      })
      .select('id')
      .single()

    if (subErr || !subRow) {
      return NextResponse.json({ error: subErr?.message || 'Failed to create subscription record' }, { status: 500 })
    }

    // Initiate Paystack transaction
    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amountKobo,
        currency: 'NGN',
        callback_url: `${siteUrl}/api/subscribe/callback`,
        metadata: {
          action: 'subscribe',
          plan_id: planId,
          plan_name: plan.name,
          billing_cycle: billingCycle,
          user_id: user.id,
          subscription_id: subRow.id,
          custom_fields: [
            { display_name: 'Plan',         variable_name: 'plan',          value: plan.name },
            { display_name: 'Billing',      variable_name: 'billing_cycle', value: billingCycle },
          ],
        },
      }),
    })

    const paystackData = await paystackRes.json()

    if (!paystackData.status) {
      // Clean up pending row on Paystack failure
      await admin.from('subscriptions').delete().eq('id', subRow.id)
      return NextResponse.json({ error: paystackData.message || 'Payment init failed' }, { status: 500 })
    }

    // Store reference on the pending row
    await admin
      .from('subscriptions')
      .update({ payment_ref: paystackData.data.reference })
      .eq('id', subRow.id)

    return NextResponse.json({
      authorizationUrl: paystackData.data.authorization_url,
      reference: paystackData.data.reference,
    })
  } catch (err) {
    console.error('[subscribe] unexpected error:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
