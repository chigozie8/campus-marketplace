import { supabaseAdmin } from '../config/supabaseClient.js'
import { ProductRow, PaginatedResponse } from '../types/index.js'
import { sanitiseSearchTerm, paginatedResponse } from '../utils/helpers.js'

export interface ProductQuery {
  page?: number
  limit?: number
  search?: string
  category?: string
  min_price?: number
  max_price?: number
  sort?: 'newest' | 'price_asc' | 'price_desc'
  ids?: string[]
}

export async function findProducts(params: ProductQuery): Promise<PaginatedResponse<ProductRow>> {
  const { page = 1, limit = 20, search, category, min_price, max_price, sort = 'newest', ids } = params

  let query = supabaseAdmin.from('products').select('*, profiles(full_name)', { count: 'exact' })

  if (ids && ids.length > 0) {
    query = query.in('id', ids)
  } else {
    if (search) {
      const term = sanitiseSearchTerm(search)
      query = query.ilike('name', `%${term}%`)
    }
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
  query = query.range(from, from + limit - 1)

  const { data, error, count } = await query
  if (error) throw new Error(error.message)
  return paginatedResponse(data as ProductRow[], count, page, limit)
}

export async function findProductById(id: string): Promise<ProductRow> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, profiles(full_name)')
    .eq('id', id)
    .single()

  if (error || !data) throw Object.assign(new Error('Product not found.'), { status: 404 })
  return data as ProductRow
}

export async function insertProduct(vendorId: string, productData: Partial<ProductRow>): Promise<ProductRow> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({ ...productData, vendor_id: vendorId })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as ProductRow
}

export async function updateProduct(id: string, vendorId: string, updates: Partial<ProductRow>): Promise<ProductRow> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('vendor_id', vendorId)
    .select()
    .single()

  if (error || !data) throw Object.assign(new Error('Product not found or not owned by you.'), { status: 404 })
  return data as ProductRow
}

export async function deleteProduct(id: string, vendorId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', id)
    .eq('vendor_id', vendorId)

  if (error) throw new Error(error.message)
}

export async function searchProductsByKeyword(keyword: string, limit = 5): Promise<ProductRow[]> {
  const term = sanitiseSearchTerm(keyword)
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id, name, price, description, category, vendor_id, profiles(full_name)')
    .ilike('name', `%${term}%`)
    .gt('stock_quantity', 0)
    .limit(limit)

  if (error) return []
  return (data ?? []) as ProductRow[]
}
