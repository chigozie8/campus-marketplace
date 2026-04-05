import { supabaseAdmin } from '../config/supabaseClient.js'
import { sanitiseSearchTerm, paginatedResponse } from '../utils/helpers.js'
import logger from '../utils/logger.js'

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

export async function createProduct(vendorId, productData) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({ ...productData, vendor_id: vendorId })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function getProducts({ page = 1, limit = 20, search, category, min_price, max_price, sort = 'newest' }) {
  let query = supabaseAdmin.from('products').select('*, profiles(full_name)', { count: 'exact' })

  if (search) {
    const term = sanitiseSearchTerm(search)
    query = query.ilike('name', `%${term}%`)
  }
  if (category) query = query.eq('category', category)
  if (min_price !== undefined) query = query.gte('price', min_price)
  if (max_price !== undefined) query = query.lte('price', max_price)

  switch (sort) {
    case 'price_asc':  query = query.order('price', { ascending: true });  break
    case 'price_desc': query = query.order('price', { ascending: false }); break
    default:           query = query.order('created_at', { ascending: false })
  }

  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) throw new Error(error.message)
  return paginatedResponse(data, count, page, limit)
}

export async function getProductById(id) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, profiles(full_name, email)')
    .eq('id', id)
    .single()

  if (error || !data) throw Object.assign(new Error('Product not found.'), { status: 404 })
  return data
}

export async function updateProduct(id, vendorId, updates) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('vendor_id', vendorId)
    .select()
    .single()

  if (error || !data) throw Object.assign(new Error('Product not found or not owned by you.'), { status: 404 })
  return data
}

export async function deleteProduct(id, vendorId) {
  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', id)
    .eq('vendor_id', vendorId)

  if (error) throw new Error(error.message)
}

// ─── ORDERS ──────────────────────────────────────────────────────────────────

export async function createOrder(buyerId, { product_id, quantity, delivery_address }) {
  // Fetch product to calculate total
  const product = await getProductById(product_id)

  if (product.stock_quantity < quantity) {
    throw Object.assign(new Error('Insufficient stock.'), { status: 400 })
  }

  const total_amount = product.price * quantity

  const { data, error } = await supabaseAdmin
    .from('orders')
    .insert({
      buyer_id: buyerId,
      product_id,
      vendor_id: product.vendor_id,
      quantity,
      total_amount,
      delivery_address,
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return { ...data, product }
}

export async function getOrderById(id) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, products(*), profiles!orders_buyer_id_fkey(full_name, email)')
    .eq('id', id)
    .single()

  if (error || !data) throw Object.assign(new Error('Order not found.'), { status: 404 })
  return data
}

export async function getUserOrders(buyerId, page = 1, limit = 20) {
  const from = (page - 1) * limit
  const { data, error, count } = await supabaseAdmin
    .from('orders')
    .select('*, products(name, price, image_url)', { count: 'exact' })
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1)

  if (error) throw new Error(error.message)
  return paginatedResponse(data, count, page, limit)
}

export async function getVendorOrders(vendorId, page = 1, limit = 20) {
  const from = (page - 1) * limit
  const { data, error, count } = await supabaseAdmin
    .from('orders')
    .select('*, products(name, price), profiles!orders_buyer_id_fkey(full_name, email)', { count: 'exact' })
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1)

  if (error) throw new Error(error.message)
  return paginatedResponse(data, count, page, limit)
}

export async function updateOrderStatus(id, status) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error || !data) throw Object.assign(new Error('Order not found.'), { status: 404 })
  return data
}

export async function getOrderByReference(reference) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('payment_reference', reference)
    .single()

  if (error || !data) return null
  return data
}

export async function setOrderPaymentReference(orderId, reference) {
  const { error } = await supabaseAdmin
    .from('orders')
    .update({ payment_reference: reference, updated_at: new Date().toISOString() })
    .eq('id', orderId)

  if (error) throw new Error(error.message)
}

// ─── PRODUCTS SEARCH (for bot) ────────────────────────────────────────────────

export async function searchProductsByKeyword(keyword, limit = 5) {
  const term = sanitiseSearchTerm(keyword)
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id, name, price, description, category, vendor_id, profiles(full_name)')
    .ilike('name', `%${term}%`)
    .gt('stock_quantity', 0)
    .limit(limit)

  if (error) {
    logger.warn(`Bot product search error: ${error.message}`)
    return []
  }
  return data ?? []
}
