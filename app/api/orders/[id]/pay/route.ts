import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_BASE = 'https://api.paystack.co'
const PLATFORM_FEE_KOBO = 10000

function db() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

function generateRef(): string {
  return `VX-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: orderId } = await params

    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ success: false, message: 'Payment system is not configured' }, { status: 503 })
    }

    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

    // getUser() already includes the email — no separate admin lookup needed
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

    const email = user.email
    if (!email) {
      return NextResponse.json({ success: false, message: 'Account has no email address' }, { status: 400 })
    }

    const admin = db()

    const { data: order, error: orderErr } = await admin
      .from('orders')
      .select('id, buyer_id, seller_id, total_amount, status')
      .eq('id', orderId)
      .single()

    if (orderErr || !order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 })
    }
    if (order.buyer_id !== user.id) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }
    if (order.status !== 'pending') {
      return NextResponse.json({ success: false, message: 'Order is not pending payment' }, { status: 400 })
    }

    const { data: sellerProfile } = await admin
      .from('profiles')
      .select('paystack_subaccount_code')
      .eq('id', order.seller_id)
      .single()

    const subaccountCode = (sellerProfile as { paystack_subaccount_code?: string | null } | null)?.paystack_subaccount_code ?? null

    const reference = generateRef()
    // Derive the callback URL from the actual request origin so dev and prod
    // both redirect back to the correct domain after Paystack.
    const reqOrigin = req.headers.get('origin')
    const fwdHost = req.headers.get('x-forwarded-host')
    const siteUrl =
      reqOrigin ||
      (fwdHost ? `https://${fwdHost}` : null) ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'https://campus-marketplace.replit.app'
    const callbackUrl = `${siteUrl}/payment/callback`

    const payload: Record<string, unknown> = {
      email,
      amount: Math.round(order.total_amount * 100),
      reference,
      metadata: { order_id: orderId },
      callback_url: callbackUrl,
    }

    if (subaccountCode) {
      payload.subaccount = subaccountCode
      payload.bearer = 'account'
      payload.transaction_charge = PLATFORM_FEE_KOBO
    }

    const paystackRes = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const paystackData = await paystackRes.json()

    if (!paystackRes.ok || !paystackData?.data?.authorization_url) {
      return NextResponse.json(
        { success: false, message: paystackData?.message ?? 'Payment initialization failed' },
        { status: 502 },
      )
    }

    await admin
      .from('orders')
      .update({ payment_ref: reference, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    return NextResponse.json({
      success: true,
      data: {
        authorization_url: paystackData.data.authorization_url,
        reference: paystackData.data.reference,
        access_code: paystackData.data.access_code,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}
