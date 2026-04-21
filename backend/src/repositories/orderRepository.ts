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

  // When an order is marked completed/delivered, credit referral + bump seller's sales count
  if (status === 'completed' || status === 'delivered') {
    const order = data as OrderRow

    // Fire-and-forget — don't block the response if any of these fail
    if (order.buyer_id) {
      try {
        await supabaseAdmin.rpc('credit_referral', { p_buyer_id: order.buyer_id })
      } catch (err) {
        console.warn('[orderRepository] credit_referral failed:', err)
      }
    }

    // Recount this seller's completed/delivered orders and write to profiles.total_sales.
    // Recounting (vs. incrementing) is self-healing — it backfills any past sales that
    // never got credited and stays correct even if an order is reverted.
    if (order.seller_id) {
      try {
        const { count } = await supabaseAdmin
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('seller_id', order.seller_id)
          .in('status', ['delivered', 'completed'])

        if (typeof count === 'number') {
          await supabaseAdmin
            .from('profiles')
            .update({ total_sales: count, updated_at: new Date().toISOString() })
            .eq('id', order.seller_id)
        }
      } catch (err) {
        console.warn('[orderRepository] total_sales sync failed:', err)
      }
    }
  }

  return data as OrderRow
}

export async function setDeliveryDuration(id: string, days: number): Promise<OrderRow> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ delivery_duration_days: days, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    // Surface a clearer message if the column hasn't been added yet
    if (error.message?.includes('delivery_duration_days')) {
      throw Object.assign(
        new Error('The delivery_duration_days column is missing from the orders table. Run supabase/add_delivery_duration.sql in the Supabase SQL editor.'),
        { status: 500 }
      )
    }
    throw new Error(error.message)
  }
  if (!data) throw Object.assign(new Error('Order not found.'), { status: 404 })
  return data as OrderRow
}

export async function setOrderTracking(
  id: string,
  trackingNumber: string | null,
  trackingCourier: string | null,
): Promise<OrderRow> {
  const updates: Record<string, string | null> = {
    tracking_number: trackingNumber && trackingNumber.trim().length > 0 ? trackingNumber.trim() : null,
    tracking_courier: trackingCourier && trackingCourier.trim().length > 0 ? trackingCourier.trim() : null,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.message?.includes('tracking_number') || error.message?.includes('tracking_courier')) {
      throw Object.assign(
        new Error('Tracking columns are missing from the orders table. Run supabase/add_tracking_info.sql in the Supabase SQL editor.'),
        { status: 500 }
      )
    }
    throw new Error(error.message)
  }
  if (!data) throw Object.assign(new Error('Order not found.'), { status: 404 })
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
