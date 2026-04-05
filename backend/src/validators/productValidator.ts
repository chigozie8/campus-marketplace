import { z } from 'zod'

export const createProductSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().min(5).max(2000),
  price: z.number().positive().multipleOf(0.01),
  category: z.string().min(2).max(100),
  stock_quantity: z.number().int().min(0).default(0),
  image_url: z.string().url().optional().or(z.literal('')),
})

export const updateProductSchema = z
  .object({
    name: z.string().min(2).max(200).optional(),
    description: z.string().min(5).max(2000).optional(),
    price: z.number().positive().multipleOf(0.01).optional(),
    category: z.string().min(2).max(100).optional(),
    stock_quantity: z.number().int().min(0).optional(),
    image_url: z.string().url().optional().or(z.literal('')),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field must be provided.' })

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  min_price: z.coerce.number().min(0).optional(),
  max_price: z.coerce.number().min(0).optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc']).default('newest'),
})
