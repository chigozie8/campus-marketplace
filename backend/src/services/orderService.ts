import * as orderRepo from '../repositories/orderRepository.js'
import * as productRepo from '../repositories/productRepository.js'
import { getCache, setCache, delCache } from '../utils/cache.js'
import { OrderRow, OrderStatus, PaginatedResponse } from '../types/index.js'
import { addTrustScoreJob } from '../queues/trustScoreQueue.js'
import logger from '../utils/logger.js'

const CACHE_TTL = 60

export async function createOrder(
  buyerId: string,
  data: { product_id: string; quantity: number; delivery_address: string }
): Promise<OrderRow> {
  const product = await productRepo.findProductById(data.product_id)

  // The products table uses seller_id; vendor_id is the backend type alias
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

  // Trigger trust score recalculation on terminal statuses
  if (status === 'completed') {
    addTrustScoreJob({ type: 'order_completed', vendorId: order.seller_id })
      .catch(err => logger.warn(`[orderService] Trust score job failed: ${err.message}`))
    // Release seller earnings from pending to available wallet
    import('../services/walletService.js')
      .then(w => w.releaseSellerEarnings(order.seller_id, order.id))
      .catch(err => logger.warn(`[orderService] Wallet release failed: ${err.message}`))
  } else if (status === 'cancelled') {
    addTrustScoreJob({ type: 'order_failed', vendorId: order.seller_id })
      .catch(err => logger.warn(`[orderService] Trust score job failed: ${err.message}`))
  }

  return order
}

export async function getOrderByReference(reference: string): Promise<OrderRow | null> {
  return orderRepo.findOrderByReference(reference)
}

export async function setOrderPaymentReference(orderId: string, reference: string): Promise<void> {
  await orderRepo.setOrderPaymentReference(orderId, reference)
}
