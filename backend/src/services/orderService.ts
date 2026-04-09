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
        body: `A buyer paid for "${productTitle}" (Order #${shortId}). Please ship as soon as possible.`,
        data: { url: '/seller-orders', orderId: id },
      }).catch(() => {})
      break

    case 'shipped':
      notify({
        userId: order.buyer_id,
        type: 'order_shipped',
        title: 'Your Order is on the Way!',
        body: `"${productTitle}" (Order #${shortId}) has been shipped. Confirm delivery once you receive it.`,
        data: { url: '/dashboard/orders', orderId: id },
      }).catch(() => {})
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
      addTrustScoreJob({ type: 'order_failed', vendorId: order.seller_id })
        .catch(err => logger.warn(`[orderService] Trust score job failed: ${err.message}`))
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
