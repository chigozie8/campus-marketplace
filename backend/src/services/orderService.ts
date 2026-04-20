import * as orderRepo from '../repositories/orderRepository.js'
import * as productRepo from '../repositories/productRepository.js'
import { supabaseAdmin } from '../config/supabaseClient.js'
import { getCache, setCache, delCache } from '../utils/cache.js'
import { OrderRow, OrderStatus, PaginatedResponse } from '../types/index.js'
import { addTrustScoreJob } from '../queues/trustScoreQueue.js'
import { notify } from './notificationService.js'
import logger from '../utils/logger.js'

const CACHE_TTL = 60

export async function createOrder(
  buyerId: string,
  data: { product_id: string; quantity: number; delivery_address: string }
): Promise<OrderRow> {
  const product = await productRepo.findProductById(data.product_id)

  const sellerId = (product as any).seller_id ?? product.vendor_id

  if ((product.stock_quantity ?? Infinity) < data.quantity) {
    throw Object.assign(new Error('Insufficient stock.'), { status: 400 })
  }

  const total_amount = product.price * data.quantity

  const order = await orderRepo.insertOrder({
    buyer_id: buyerId,
    product_id: data.product_id,
    seller_id: sellerId,
    quantity: data.quantity,
    total_amount,
    delivery_address: data.delivery_address,
    status: 'pending',
  })

  // Decrement stock quantity so overselling is prevented
  if (product.stock_quantity !== null && product.stock_quantity !== undefined) {
    const newQty = Math.max(0, product.stock_quantity - data.quantity)
    await supabaseAdmin
      .from('products')
      .update({ stock_quantity: newQty })
      .eq('id', data.product_id)
      .catch(err => logger.warn(`[orderService] stock decrement failed: ${err.message}`))
  }

  return { ...order, product } as OrderRow
}

export async function getOrderById(id: string): Promise<OrderRow> {
  const cacheKey = `orders:id:${id}`
  const cached = await getCache<OrderRow>(cacheKey)
  if (cached) return cached

  const order = await orderRepo.findOrderById(id)
  await setCache(cacheKey, order, CACHE_TTL)
  return order
}

export async function getUserOrders(buyerId: string, page: number, limit: number): Promise<PaginatedResponse<OrderRow>> {
  const cacheKey = `orders:buyer:${buyerId}:${page}:${limit}`
  const cached = await getCache<PaginatedResponse<OrderRow>>(cacheKey)
  if (cached) return cached

  const result = await orderRepo.findOrdersByBuyer(buyerId, page, limit)
  await setCache(cacheKey, result, CACHE_TTL)
  return result
}

export async function getVendorOrders(vendorId: string, page: number, limit: number): Promise<PaginatedResponse<OrderRow>> {
  const cacheKey = `orders:vendor:${vendorId}:${page}:${limit}`
  const cached = await getCache<PaginatedResponse<OrderRow>>(cacheKey)
  if (cached) return cached

  const result = await orderRepo.findOrdersByVendor(vendorId, page, limit)
  await setCache(cacheKey, result, CACHE_TTL)
  return result
}

export async function setOrderTracking(
  id: string,
  trackingNumber: string | null,
  trackingCourier: string | null,
): Promise<OrderRow> {
  return orderRepo.setOrderTracking(id, trackingNumber, trackingCourier)
}

export async function setDeliveryDuration(id: string, days: number): Promise<OrderRow> {
  const order = await orderRepo.setDeliveryDuration(id, days)
  await delCache(`orders:id:${id}`)

  const shortId = id.split('-')[0].toUpperCase()
  const productTitle = (order as any).products?.title ?? 'your item'
  const dayLabel = days === 1 ? '1 day' : `${days} days`

  // Notify the buyer the seller has committed to a delivery window
  notify({
    userId: order.buyer_id,
    type: 'delivery_estimate_set',
    title: 'Delivery Window Set by Seller',
    body: `Good news! Your seller has set a delivery window of ${dayLabel} for "${productTitle}" (Order #${shortId}). If they don't ship within ${dayLabel}, your payment is automatically reversed.`,
    data: { url: '/dashboard/orders', orderId: id },
  }).catch(() => {})

  return order
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<OrderRow> {
  const order = await orderRepo.updateOrderStatus(id, status)
  await delCache(`orders:id:${id}`)

  const shortId = id.split('-')[0].toUpperCase()
  const productTitle = (order as any).products?.title ?? 'your item'

  switch (status) {
    case 'paid':
      notify({
        userId: order.seller_id,
        type: 'order_paid',
        title: 'New Order — Action Required',
        body: `A buyer paid for "${productTitle}" (Order #${shortId}). Please ship within 5 days, or the order will be auto-cancelled and refunded.`,
        data: { url: '/seller-orders', orderId: id },
      }).catch(() => {})
      // Tell the buyer their payment went through and when to expect shipment
      notify({
        userId: order.buyer_id,
        type: 'order_paid',
        title: 'Payment Confirmed — Awaiting Shipment',
        body: `Your payment for "${productTitle}" (Order #${shortId}) is held safely in escrow. Your seller has 5 days to ship — you'll be notified the moment it's on the way. If they don't ship in time, your payment is automatically reversed.`,
        data: { url: '/dashboard/orders', orderId: id },
      }).catch(() => {})
      break

    case 'shipped':
      notify({
        userId: order.buyer_id,
        type: 'order_shipped',
        title: 'Your Order is on the Way!',
        body: `"${productTitle}" (Order #${shortId}) has been shipped. Your delivery code is in your bell notifications (and also sent by email + SMS) — enter it once your item arrives to release payment.`,
        data: { url: '/dashboard/orders', orderId: id },
      }).catch(() => {})
      // Auto-send delivery OTP to buyer so the seller never controls
      // delivery confirmation (fraud prevention). Fire-and-forget.
      ;(async () => {
        try {
          const { sendDeliveryOtpToBuyer } = await import('./deliveryOtpService.js')
          await sendDeliveryOtpToBuyer(id, order.buyer_id, 'both')
        } catch (err) {
          logger.warn(`[orderService] Auto delivery-OTP send failed for order ${id}: ${err instanceof Error ? err.message : String(err)}`)
        }
      })()
      break

    case 'delivered':
      notify({
        userId: order.buyer_id,
        type: 'order_delivered',
        title: 'Order Marked as Delivered',
        body: `Your seller marked Order #${shortId} as delivered. Please confirm receipt to release payment.`,
        data: { url: '/dashboard/orders', orderId: id },
      }).catch(() => {})
      break

    case 'completed':
      notify({
        userId: order.seller_id,
        type: 'order_completed',
        title: 'Payment Released to Your Wallet!',
        body: `Buyer confirmed delivery for Order #${shortId}. Your earnings have been added to your wallet.`,
        data: { url: '/dashboard/wallet', orderId: id },
      }).catch(() => {})
      notify({
        userId: order.buyer_id,
        type: 'order_completed',
        title: 'Order Complete — Thank You!',
        body: `Order #${shortId} is complete. Hope you love your purchase!`,
        data: { url: '/dashboard/orders', orderId: id },
      }).catch(() => {})
      // Review request — ask buyer to rate 24h after completion
      setTimeout(() => {
        notify({
          userId: order.buyer_id,
          type: 'review_request',
          title: '⭐ How was your order?',
          body: `You received "${productTitle}". Take a moment to leave a review — it helps other buyers!`,
          data: { url: `/dashboard/orders`, orderId: id },
        }).catch(() => {})
      }, 24 * 60 * 60 * 1000)
      // Award loyalty points — 1 point per ₦100 spent
      ;(async () => {
        try {
          const totalAmount = Number((order as any).total_amount ?? 0)
          const points = Math.max(1, Math.floor(totalAmount / 100))
          const frontendUrl = process.env.FRONTEND_URL ?? ''
          const internalKey = process.env.INTERNAL_API_KEY ?? ''
          if (frontendUrl && internalKey) {
            await fetch(`${frontendUrl}/api/loyalty/earn`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-internal-key': internalKey },
              body: JSON.stringify({ user_id: order.buyer_id, points, description: `Order #${shortId} completed`, order_id: id }),
            })
          }
        } catch (err: unknown) {
          logger.warn(`[orderService] Loyalty points failed: ${err instanceof Error ? err.message : String(err)}`)
        }
      })()
      addTrustScoreJob({ type: 'order_completed', vendorId: order.seller_id })
        .catch(err => logger.warn(`[orderService] Trust score job failed: ${err.message}`))
      import('../services/walletService.js')
        .then(w => w.releaseSellerEarnings(order.seller_id, order.id))
        .catch(err => logger.warn(`[orderService] Wallet release failed: ${err.message}`))
      break

    case 'cancelled':
      notify({
        userId: order.buyer_id,
        type: 'order_cancelled',
        title: 'Order Cancelled',
        body: `Order #${shortId} for "${productTitle}" has been cancelled.`,
        data: { url: '/dashboard/orders', orderId: id },
      }).catch(() => {})
      notify({
        userId: order.seller_id,
        type: 'order_cancelled',
        title: 'Order Cancelled',
        body: `Order #${shortId} for "${productTitle}" has been cancelled.`,
        data: { url: '/seller-orders', orderId: id },
      }).catch(() => {})
      // Email both sides via Mailtrap (fire-and-forget).
      // Look up the product title separately because orderRepo.updateOrderStatus
      // returns the bare row — no joined products. We also need the freshest
      // quantity in case the row was patched recently.
      ;(async () => {
        try {
          const { data: productRow } = await supabaseAdmin
            .from('products')
            .select('title')
            .eq('id', (order as any).product_id)
            .maybeSingle()
          const realTitle = (productRow?.title as string | undefined) || productTitle
          const { sendOrderCancelledEmails } = await import('./orderEmailService.js')
          await sendOrderCancelledEmails(order, realTitle)
        } catch (err) {
          logger.warn(`[orderService] cancellation email failed for ${id}: ${err instanceof Error ? err.message : String(err)}`)
        }
      })()
      addTrustScoreJob({ type: 'order_failed', vendorId: order.seller_id })
        .catch(err => logger.warn(`[orderService] Trust score job failed: ${err.message}`))
      // Restore stock so the product can be sold to another buyer
      ;(async () => {
        try {
          const { data: product } = await supabaseAdmin
            .from('products')
            .select('stock_quantity')
            .eq('id', (order as any).product_id)
            .single()
          if (product && product.stock_quantity !== null && product.stock_quantity !== undefined) {
            const qty = Number((order as any).quantity ?? 1)
            await supabaseAdmin
              .from('products')
              .update({ stock_quantity: product.stock_quantity + qty })
              .eq('id', (order as any).product_id)
            logger.info(`[orderService] Restored ${qty} unit(s) to product ${(order as any).product_id} after cancellation of order ${id}.`)
          }
        } catch (err: unknown) {
          logger.warn(`[orderService] Stock restoration failed for order ${id}: ${err instanceof Error ? err.message : String(err)}`)
        }
      })()
      break
  }

  return order
}

export async function getOrderByReference(reference: string): Promise<OrderRow | null> {
  return orderRepo.findOrderByReference(reference)
}

export async function setOrderPaymentReference(orderId: string, reference: string): Promise<void> {
  await orderRepo.setOrderPaymentReference(orderId, reference)
}
