import Joi from 'joi'

export const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().min(5).max(2000).required(),
  price: Joi.number().positive().precision(2).required(),
  category: Joi.string().min(2).max(100).required(),
  stock_quantity: Joi.number().integer().min(0).default(0),
  image_url: Joi.string().uri().optional().allow(''),
})

export const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(200),
  description: Joi.string().min(5).max(2000),
  price: Joi.number().positive().precision(2),
  category: Joi.string().min(2).max(100),
  stock_quantity: Joi.number().integer().min(0),
  image_url: Joi.string().uri().optional().allow(''),
}).min(1)

export const productQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().max(100).optional(),
  category: Joi.string().max(100).optional(),
  min_price: Joi.number().min(0).optional(),
  max_price: Joi.number().min(0).optional(),
  sort: Joi.string().valid('newest', 'price_asc', 'price_desc').default('newest'),
})
