import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { markOrderPaidAndNotify } from '@/lib/order-payment'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_BASE = 'https://api.paystack.co'

function db() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

/**
 * Called from the /payment/callback page after Paystack redirects the buyer
 * back. Verifies the transaction directly with Paystack, then idempotently
 * flips the order to 'paid' and triggers buyer + seller emails.
 *
 * This is the PRIMARY trigger for confirmation emails — webhooks are a backup
 * for users who close the browser before redirect (and may not arrive at all
 * in dev if the dashboard webhook URL is stale).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ reference: string }> },
) {
  try {
    const { reference } = await params

    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { success: false, message: 'Payment system is not configured' },
        { status: 200 }, // 200 so the client `.then` runs and shows a friendly error
      )
    }

    // Verify the transaction directly with Paystack (server-side, secret-key auth).
    const psRes = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      cache: 'no-store',
    })
    const psBody = await psRes.json().catch(() => ({}))
    const tx = psBody?.data ?? {}
    const status: string = tx?.status ?? 'failed'
    const metadata: { order_id?: string } = tx?.metadata ?? {}

    // Bind the verify result to a SPECIFIC order via payment_ref. The pay
    // route always writes payment_ref before redirecting to Paystack, so the
    // primary lookup should always hit. The metadata fallback only matters if
    // that write failed AND we haven't bound yet — and even then we refuse to
    // adopt a reference that's already attached to a different order.
    const admin = db()
    let orderId: string | null = null

    const { data: byRef } = await admin
      .from('orders')
      .select('id')
      .eq('payment_ref', reference)
      .maybeSingle()

    if (byRef?.id) {
      orderId = byRef.id
    } else if (metadata.order_id) {
      const { data: byMeta } = await admin
        .from('orders')
        .select('id, payment_ref')
        .eq('id', metadata.order_id)
        .maybeSingle()
      // Only adopt if this order has no ref yet (or already has THIS ref).
      if (byMeta && (!byMeta.payment_ref || byMeta.payment_ref === reference)) {
        orderId = byMeta.id
      } else {
        console.warn(`[verify] metadata order_id ${metadata.order_id} has different payment_ref — refusing to bind ${reference}`)
      }
    }

    // On success, flip the order and fire emails. Idempotent — if the webhook
    // already did it, this is a no-op (returns false).
    if (status === 'success' && orderId) {
      const flipped = await markOrderPaidAndNotify(orderId, reference)
      console.log(`[verify] ref=${reference} order=${orderId} flipped=${flipped}`)
    }

    // Trim response surface — only what the callback page actually consumes.
    return NextResponse.json({
      success: true,
      data: {
        status,
        order_id: orderId,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error'
    console.error('[verify] failed:', msg)
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}
