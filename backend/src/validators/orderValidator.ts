import { z } from 'zod'

export const createOrderSchema = z.object({
  product_id: z.string().uuid('product_id must be a valid UUID.'),
  quantity: z.number().int().min(1).default(1),
  delivery_address: z.string().min(5).max(500),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'shipped', 'delivered', 'completed', 'cancelled']),
})

export const setDeliveryDurationSchema = z.object({
  days: z.number().int().min(1, 'Delivery window must be at least 1 day.').max(30, 'Delivery window cannot exceed 30 days.'),
})

export const setTrackingSchema = z.object({
  tracking_number: z.string().trim().max(120).nullable().optional(),
  tracking_courier: z.string().trim().max(80).nullable().optional(),
})
