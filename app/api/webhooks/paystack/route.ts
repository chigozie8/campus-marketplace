import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { sendOrderPaidEmail, sendNewPaidOrderToSellerEmail } from '@/lib/email'

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
        // Only proceed if the update actually flips a pending order to paid.
        // .select() returns the updated row(s) so we can guard against double-emails
        // when Paystack retries the webhook.
        const { data: updated } = await admin
          .from('orders')
          .update({
            status: 'paid',
            payment_status: 'paid',
            payment_ref: reference,
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId)
          .eq('status', 'pending')
          .select('id, buyer_id, seller_id, quantity, total_amount, delivery_address, products(title)')

        const row = Array.isArray(updated) ? updated[0] : null
        if (row) {
          // Look up buyer + seller emails/names in parallel
          const [
            { data: buyerAuth },
            { data: sellerAuth },
            { data: buyerProfile },
            { data: sellerProfile },
          ] = await Promise.all([
            admin.auth.admin.getUserById(row.buyer_id as string),
            admin.auth.admin.getUserById(row.seller_id as string),
            admin.from('profiles').select('full_name').eq('id', row.buyer_id).maybeSingle(),
            admin.from('profiles').select('full_name').eq('id', row.seller_id).maybeSingle(),
          ])

          const productTitle =
            (Array.isArray(row.products) ? row.products[0] : row.products)?.title ?? 'your order'
          const buyerEmail = buyerAuth?.user?.email ?? null
          const sellerEmail = sellerAuth?.user?.email ?? null
          const buyerName = buyerProfile?.full_name ?? 'there'
          const sellerName = sellerProfile?.full_name ?? 'there'

          // Buyer confirmation
          if (buyerEmail) {
            sendOrderPaidEmail(buyerEmail, buyerName, {
              id: row.id as string,
              productTitle,
              quantity: row.quantity as number,
              total: row.total_amount as number,
              sellerName,
            }).catch(() => {})
          }

          // Seller "you've got a paid order" notification
          if (sellerEmail) {
            sendNewPaidOrderToSellerEmail(sellerEmail, sellerName, {
              id: row.id as string,
              productTitle,
              quantity: row.quantity as number,
              total: row.total_amount as number,
              buyerName,
              deliveryAddress: row.delivery_address as string | undefined,
            }).catch(() => {})
          }
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch {
    return NextResponse.json({ message: 'Webhook processing failed' }, { status: 500 })
  }
}
