import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_BASE = 'https://api.paystack.co'

function db() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ reference: string }> },
) {
  try {
    const { reference } = await params

    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ success: false, message: 'Payment system not configured' }, { status: 503 })
    }

    const paystackRes = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    })

    const paystackData = await paystackRes.json()

    if (!paystackRes.ok) {
      return NextResponse.json({ success: false, message: paystackData?.message ?? 'Verification failed' }, { status: 502 })
    }

    const tx = paystackData.data
    const status: string = tx.status ?? 'failed'

    // Prefer order_id from Paystack metadata, fall back to looking up in our DB
    let orderId: string | null = tx.metadata?.order_id ?? null

    const admin = db()

    if (!orderId) {
      const { data: orderRow } = await admin
        .from('orders')
        .select('id')
        .eq('payment_ref', reference)
        .maybeSingle()
      orderId = orderRow?.id ?? null
    }

    if (status === 'success' && orderId) {
      await admin
        .from('orders')
        .update({ status: 'paid', payment_status: 'paid', updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .eq('payment_ref', reference)
    }

    return NextResponse.json({
      success: true,
      data: {
        status,
        amount: tx.amount / 100,
        order_id: orderId,
        metadata: tx.metadata ?? {},
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}
