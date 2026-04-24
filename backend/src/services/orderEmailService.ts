import { supabaseAdmin } from '../config/supabaseClient.js'
import logger from '../utils/logger.js'

/**
 * Thin helper that calls the Next.js internal email endpoint to send order
 * cancellation emails via Mailtrap. The backend doesn't import the email
 * templates directly (those live in the Next app) — it just POSTs JSON
 * with the shared internal key. Errors are logged, never thrown.
 */
async function postInternal(path: string, body: unknown): Promise<void> {
  const appUrl = process.env.INTERNAL_APP_URL ?? 'http://localhost:5000'
  const internalKey = process.env.INTERNAL_API_KEY ?? ''
  if (!internalKey) {
    logger.warn(`[orderEmail] INTERNAL_API_KEY not set — skipping email POST to ${path}`)
    return
  }
  try {
    const res = await fetch(`${appUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-internal-key': internalKey },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      logger.warn(`[orderEmail] ${path} returned ${res.status}: ${txt.slice(0, 200)}`)
    }
  } catch (err) {
    logger.warn(`[orderEmail] ${path} fetch failed: ${err instanceof Error ? err.message : String(err)}`)
  }
}

interface OrderLike {
  id: string
  buyer_id: string
  seller_id: string
  quantity?: number
  total_amount?: number
}

/**
 * Look up buyer + seller email/name and POST two cancellation emails to the
 * Next internal endpoint — one for each side, with audience-appropriate copy.
 */
export async function sendOrderCancelledEmails(
  order: OrderLike,
  productTitle: string,
  opts: { reason?: string; autoCancelled?: boolean } = {},
): Promise<void> {
  const [buyerAuth, sellerAuth, buyerProfile, sellerProfile] = await Promise.all([
    supabaseAdmin.auth.admin.getUserById(order.buyer_id),
    supabaseAdmin.auth.admin.getUserById(order.seller_id),
    supabaseAdmin.from('profiles').select('full_name').eq('id', order.buyer_id).maybeSingle(),
    supabaseAdmin.from('profiles').select('full_name').eq('id', order.seller_id).maybeSingle(),
  ])

  const orderPayload = {
    id: order.id,
    productTitle,
    quantity: Number(order.quantity ?? 1),
    total: Number(order.total_amount ?? 0),
  }

  const buyerEmail = buyerAuth.data.user?.email
  const sellerEmail = sellerAuth.data.user?.email

  const sends: Promise<void>[] = []
  if (buyerEmail) {
    sends.push(postInternal('/api/internal/send-order-cancelled-email', {
      to: buyerEmail,
      name: (buyerProfile.data?.full_name as string | undefined) || 'there',
      audience: 'buyer',
      order: orderPayload,
      reason: opts.reason,
      autoCancelled: opts.autoCancelled ?? false,
    }))
  }
  if (sellerEmail) {
    sends.push(postInternal('/api/internal/send-order-cancelled-email', {
      to: sellerEmail,
      name: (sellerProfile.data?.full_name as string | undefined) || 'there',
      audience: 'seller',
      order: orderPayload,
      reason: opts.reason,
      autoCancelled: opts.autoCancelled ?? false,
    }))
  }
  await Promise.all(sends)
}
