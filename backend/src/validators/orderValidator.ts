import { z } from 'zod'

export const createOrderSchema = z.object({
  product_id: z.string().uuid('product_id must be a valid UUID.'),
  quantity: z.number().int().min(1).default(1),
  delivery_address: z.string().min(5).max(500),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'shipped', 'delivered', 'completed', 'cancelled']),
})
