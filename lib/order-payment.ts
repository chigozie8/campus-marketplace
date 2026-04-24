import { createClient as createAdmin } from '@supabase/supabase-js'
import { sendOrderPaidEmail, sendNewPaidOrderToSellerEmail } from '@/lib/email'

function db() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

/**
 * Idempotently flip an order from 'pending' → 'paid' and send buyer + seller
 * confirmation emails. Safe to call from BOTH the Paystack webhook and the
 * post-redirect verify endpoint — whichever arrives first wins; the other is
 * a no-op because the `.eq('status', 'pending')` guard returns zero rows.
 *
 * Returns true if THIS call did the flip (i.e. emails were attempted), false
 * if the order was already paid/cancelled or not found.
 */
export async function markOrderPaidAndNotify(
  orderId: string,
  paymentRef: string,
): Promise<boolean> {
  const admin = db()

  const { data: updated, error: updateErr } = await admin
    .from('orders')
    .update({
      status: 'paid',
      payment_status: 'paid',
      payment_ref: paymentRef,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .eq('status', 'pending')
    .select('id, buyer_id, seller_id, quantity, total_amount, delivery_address, products(title)')

  if (updateErr) {
    console.error(`[markOrderPaid] update failed order=${orderId} ref=${paymentRef}:`, updateErr.message)
    return false
  }

  const row = Array.isArray(updated) ? updated[0] : null
  if (!row) return false // Already paid/cancelled or not found — no-op (expected in race).

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
  const buyerName = (buyerProfile?.full_name as string | undefined) ?? 'there'
  const sellerName = (sellerProfile?.full_name as string | undefined) ?? 'there'

  if (buyerEmail) {
    sendOrderPaidEmail(buyerEmail, buyerName, {
      id: row.id as string,
      productTitle,
      quantity: row.quantity as number,
      total: row.total_amount as number,
      sellerName,
    }).catch(() => {})
  }

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

  return true
}
