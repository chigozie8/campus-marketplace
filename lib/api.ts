'use client'

import { createClient } from '@/lib/supabase/client'

async function getAuthToken(): Promise<string | null> {
  const supabase = createClient()
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) headers['Authorization'] = `Bearer ${token}`

  // Route through Next.js proxy so the browser never needs to reach the
  // backend port directly — works in every deployment environment.
  const url = `/api/backend${path}`
  const res = await fetch(url, { ...options, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(body.message || `HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}

// Calls Next.js API routes directly (not via the backend Express proxy).
// Used for routes implemented as native Next.js handlers.
async function directRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  const res = await fetch(path, { ...options, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(body.message || `HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    request<{ success: boolean; data: { access_token: string; refresh_token: string; user: { id: string; email: string } } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    ),

  register: (email: string, password: string, full_name: string, role: 'buyer' | 'vendor') =>
    request<{ success: boolean; data: { user_id: string; email: string; role: string } }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify({ email, password, full_name, role }) }
    ),

  getProfile: () =>
    request<{ success: boolean; data: BackendProfile }>('/auth/profile'),
}

// ─── Products ─────────────────────────────────────────────────────────────────

export const productsApi = {
  list: (params?: ProductQueryParams) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : ''
    return request<PaginatedResponse<BackendProduct>>(`/products${qs}`)
  },

  getById: (id: string) =>
    request<{ success: boolean; data: BackendProduct }>(`/products/${id}`),

  create: (data: CreateProductPayload) =>
    request<{ success: boolean; data: BackendProduct }>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreateProductPayload>) =>
    request<{ success: boolean; data: BackendProduct }>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/products/${id}`, { method: 'DELETE' }),
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export const ordersApi = {
  // Uses the direct Next.js API route — works in production without the Express backend.
  create: (data: CreateOrderPayload) =>
    directRequest<{ success: boolean; data: BackendOrder }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMyOrders: (page = 1, limit = 20) =>
    request<PaginatedResponse<BackendOrder>>(`/orders/me?page=${page}&limit=${limit}`),

  getById: (id: string) =>
    request<{ success: boolean; data: BackendOrder }>(`/orders/${id}`),

  updateStatus: (id: string, status: OrderStatus) =>
    request<{ success: boolean; data: BackendOrder }>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  setDeliveryDuration: (id: string, days: number) =>
    request<{ success: boolean; data: BackendOrder; message?: string }>(`/orders/${id}/delivery-duration`, {
      method: 'PATCH',
      body: JSON.stringify({ days }),
    }),

  // Uses the direct Next.js API route — works in production without the Express backend.
  initializePayment: (id: string) =>
    directRequest<{ success: boolean; data: { authorization_url: string; reference: string } }>(`/api/orders/${id}/pay`, {
      method: 'POST',
    }),

  // Uses the direct Next.js API route — works in production without the Express backend.
  verifyPayment: (reference: string) =>
    directRequest<{ success: boolean; data: { status: string } }>(`/api/orders/verify/${reference}`),

  getVendorOrders: (page = 1, limit = 20) =>
    request<PaginatedResponse<BackendOrder>>(`/orders/vendor/dashboard?page=${page}&limit=${limit}`),
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'completed' | 'cancelled'

export interface BackendProduct {
  id: string
  vendor_id: string
  name: string
  description: string
  price: number
  category: string
  stock_quantity: number
  image_url?: string
  created_at: string
  updated_at?: string
  profiles?: { full_name: string }
}

export interface BackendOrder {
  id: string
  buyer_id: string
  seller_id: string
  product_id: string
  quantity: number
  total_amount: number
  status: OrderStatus
  delivery_address: string
  payment_ref?: string
  delivered_at?: string
  delivery_duration_days?: number | null
  created_at: string
  updated_at?: string
  products?: { title: string; name?: string; price: number; images?: string[]; image_url?: string }
}

export interface BackendProfile {
  id: string
  full_name: string
  role: 'buyer' | 'vendor' | 'admin'
  email: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

export interface CreateOrderPayload {
  product_id: string
  quantity: number
  delivery_address: string
  coupon_id?: string
  coupon_discount?: number
}

export interface CreateProductPayload {
  name: string
  description: string
  price: number
  category: string
  stock_quantity: number
  image_url?: string
}

export interface ProductQueryParams {
  page?: string
  limit?: string
  search?: string
  category?: string
  min_price?: string
  max_price?: string
  sort?: 'newest' | 'price_asc' | 'price_desc'
}
