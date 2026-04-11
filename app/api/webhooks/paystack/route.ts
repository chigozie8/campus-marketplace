import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { createClient as createAdmin } from '@supabase/supabase-js'

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

      // Find order by reference or metadata order_id
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
        await admin
          .from('orders')
          .update({
            status: 'paid',
            payment_status: 'paid',
            payment_ref: reference,
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId)
          .eq('status', 'pending')
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch {
    return NextResponse.json({ message: 'Webhook processing failed' }, { status: 500 })
  }
}
