import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { markOrderPaidAndNotify } from '@/lib/order-payment'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!

function db() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

function verifySignature(rawBody: string, signature: string): boolean {
  const expected = createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest('hex')
  return expected === signature
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-paystack-signature') ?? ''

    if (!verifySignature(rawBody, signature)) {
      console.warn('[paystack-webhook] invalid signature')
      return NextResponse.json({ message: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(rawBody) as {
      event: string
      data: {
        reference: string
        status: string
        metadata?: { order_id?: string }
      }
    }

    if (payload.event === 'charge.success') {
      const { reference, metadata } = payload.data
      const admin = db()

      // Resolve order id either from metadata or by looking up the payment_ref.
      let orderId = metadata?.order_id ?? null
      if (!orderId) {
        const { data } = await admin
          .from('orders')
          .select('id')
          .eq('payment_ref', reference)
          .maybeSingle()
        orderId = data?.id ?? null
      }

      if (orderId) {
        const flipped = await markOrderPaidAndNotify(orderId, reference)
        console.log(`[paystack-webhook] charge.success ref=${reference} order=${orderId} flipped=${flipped}`)
      } else {
        console.warn(`[paystack-webhook] charge.success but no order found for ref ${reference}`)
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (err) {
    console.error('[paystack-webhook] processing failed:', err)
    return NextResponse.json({ message: 'Webhook processing failed' }, { status: 500 })
  }
}
