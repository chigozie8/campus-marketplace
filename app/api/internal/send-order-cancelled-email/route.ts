import { NextRequest, NextResponse } from 'next/server'
import { sendOrderCancelledEmail } from '@/lib/email'

/**
 * Internal-only endpoint called by the backend (Express) to send order
 * cancellation emails through Mailtrap. Backend POSTs JSON with the shared
 * internal key; anything without that key is rejected.
 *
 * The backend calls this twice per cancellation — once for the buyer, once
 * for the seller — so each side gets the right framing.
 */
export async function POST(req: NextRequest) {
  const key = req.headers.get('x-internal-key') ?? ''
  const expected = process.env.INTERNAL_API_KEY ?? ''
  if (!expected || key !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: {
    to?: string
    name?: string
    audience?: 'buyer' | 'seller'
    order?: { id: string; productTitle: string; quantity: number; total: number }
    reason?: string
    autoCancelled?: boolean
  }
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const { to, name, audience, order, reason, autoCancelled } = payload
  if (!to || !audience || !order?.id || !order.productTitle) {
    return NextResponse.json(
      { error: 'Missing required fields: to, audience, order.{id,productTitle,quantity,total}.' },
      { status: 400 },
    )
  }

  const result = await sendOrderCancelledEmail({
    to,
    name: name || 'there',
    audience,
    order: {
      id: order.id,
      productTitle: order.productTitle,
      quantity: Number(order.quantity ?? 1),
      total: Number(order.total ?? 0),
    },
    reason,
    autoCancelled,
  })
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 502 })
  }
  return NextResponse.json({ ok: true })
}
