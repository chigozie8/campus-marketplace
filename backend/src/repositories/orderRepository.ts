import { supabaseAdmin } from '../config/supabaseClient.js'
import { OrderRow, OrderStatus, PaginatedResponse } from '../types/index.js'
import { paginatedResponse } from '../utils/helpers.js'

export async function insertOrder(orderData: Omit<OrderRow, 'id' | 'created_at' | 'updated_at'>): Promise<OrderRow> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .insert(orderData)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as OrderRow
}

export async function findOrderById(id: string): Promise<OrderRow> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, products(*), profiles!orders_buyer_id_fkey(full_name)')
    .eq('id', id)
    .single()

  if (error || !data) throw Object.assign(new Error('Order not found.'), { status: 404 })
  return data as OrderRow
}

export async function findOrdersByBuyer(buyerId: string, page = 1, limit = 20): Promise<PaginatedResponse<OrderRow>> {
  const from = (page - 1) * limit
  const { data, error, count } = await supabaseAdmin
    .from('orders')
    .select('*, products(title, price, images)', { count: 'exact' })
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1)

  if (error) throw new Error(error.message)
  return paginatedResponse(data as OrderRow[], count, page, limit)
}

export async function findOrdersByVendor(vendorId: string, page = 1, limit = 20): Promise<PaginatedResponse<OrderRow>> {
  const from = (page - 1) * limit
  const { data, error, count } = await supabaseAdmin
    .from('orders')
    .select('*, products(title, price), profiles!orders_buyer_id_fkey(full_name)', { count: 'exact' })
    .eq('seller_id', vendorId)
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1)

  if (error) throw new Error(error.message)
  return paginatedResponse(data as OrderRow[], count, page, limit)
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<OrderRow> {
  const now = new Date().toISOString()
  const updates: Record<string, string> = { status, updated_at: now }
  if (status === 'delivered') updates.delivered_at = now

  let result = await supabaseAdmin
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  // delivered_at column may not exist yet — retry without it
  if (result.error?.message?.includes('delivered_at')) {
    const { delivered_at: _drop, ...safeUpdates } = updates
    result = await supabaseAdmin
      .from('orders')
      .update(safeUpdates)
      .eq('id', id)
      .select()
      .single()
  }

  const { data, error } = result
  if (error || !data) throw Object.assign(new Error('Order not found.'), { status: 404 })

  // When an order is marked completed/delivered, try to credit referral milestone
  if (status === 'completed' || status === 'delivered') {
    const order = data as OrderRow
    if (order.buyer_id) {
      // Fire-and-forget — don't block the response if this fails
      supabaseAdmin.rpc('credit_referral', { p_buyer_id: order.buyer_id }).catch(() => {})
    }
  }

  return data as OrderRow
}

export async function findOrderByReference(reference: string): Promise<OrderRow | null> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('payment_ref', reference)
    .single()

  if (error || !data) return null
  return data as OrderRow
}

export async function setOrderPaymentReference(orderId: string, reference: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('orders')
    .update({ payment_ref: reference, updated_at: new Date().toISOString() })
    .eq('id', orderId)

  if (error) throw new Error(error.message)
}
