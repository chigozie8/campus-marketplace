import { Request } from 'express'

export interface AuthUser {
  id: string
  email: string
  role: 'buyer' | 'vendor' | 'admin'
  [key: string]: unknown
}

export interface AuthRequest extends Request {
  user: AuthUser
  rawBody?: Buffer
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface ProductRow {
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
}

export interface OrderRow {
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
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'completed' | 'cancelled'

export interface ProfileRow {
  id: string
  full_name: string
  role: 'buyer' | 'vendor' | 'admin'
  email: string
  created_at: string
  is_business_verified?: boolean
  total_orders?: number
  successful_orders?: number
  failed_orders?: number
  disputes_count?: number
  average_rating?: number
  trust_score?: number
  instagram_handle?: string
  facebook_handle?: string
}

export type VerificationStatus = 'pending' | 'approved' | 'rejected'

export interface VerificationRow {
  id: string
  vendor_id: string
  full_name: string
  business_name: string
  phone_number: string
  location_city: string
  location_state: string
  bank_name: string
  account_number: string
  id_type: 'nin' | 'bvn' | 'drivers_license' | 'international_passport' | 'voters_card'
  id_number: string
  id_image_url: string
  selfie_image_url: string
  status: VerificationStatus
  rejection_reason?: string
  reviewed_by?: string
  reviewed_at?: string
  created_at: string
  updated_at: string
}

export interface AppError extends Error {
  status?: number
  statusCode?: number
}

export interface PaystackWebhookPayload {
  event: string
  data: {
    reference: string
    status: string
    amount: number
    metadata?: { order_id?: string }
    [key: string]: unknown
  }
}

export interface WhatsAppMessage {
  id: string
  from: string
  timestamp: string
  type: string
  text?: { body: string }
}

export interface BotSession {
  phone: string
  lastIntent?: string
  lastProductId?: string
  updatedAt: number
}

export interface PaymentInitResult {
  authorization_url: string
  reference: string
  access_code: string
}
