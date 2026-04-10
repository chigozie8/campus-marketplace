import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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

    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

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
    // Pass the real Paystack status through — callback page needs to distinguish
    // 'abandoned' (user cancelled) from 'failed' (actual payment failure).
    const status: string = tx.status ?? 'failed'

    if (status === 'success') {
      const admin = db()
      const orderId = tx.metadata?.order_id

      if (orderId) {
        await admin
          .from('orders')
          .update({ status: 'paid', updated_at: new Date().toISOString() })
          .eq('id', orderId)
          .eq('payment_ref', reference)
          .catch(() => {})
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        status,
        amount: tx.amount / 100,
        metadata: tx.metadata ?? {},
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}
