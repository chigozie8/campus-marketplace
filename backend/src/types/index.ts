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
  vendor_id: string
  product_id: string
  quantity: number
  total_amount: number
  status: OrderStatus
  delivery_address: string
  payment_reference?: string
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
