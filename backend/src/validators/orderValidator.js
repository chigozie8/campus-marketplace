import Joi from 'joi'

export const createOrderSchema = Joi.object({
  product_id: Joi.string().uuid().required().messages({
    'any.required': 'product_id is required.',
    'string.uuid': 'product_id must be a valid UUID.',
  }),
  quantity: Joi.number().integer().min(1).default(1),
  delivery_address: Joi.string().min(5).max(500).required().messages({
    'any.required': 'delivery_address is required.',
  }),
})

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'paid', 'shipped', 'delivered', 'completed', 'cancelled')
    .required(),
})
