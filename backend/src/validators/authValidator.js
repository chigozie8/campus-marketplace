import Joi from 'joi'

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address.',
    'any.required': 'Email is required.',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters.',
    'any.required': 'Password is required.',
  }),
  full_name: Joi.string().min(2).max(100).required().messages({
    'any.required': 'Full name is required.',
  }),
  role: Joi.string().valid('buyer', 'vendor').default('buyer'),
})

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})

/**
 * Returns an Express middleware that validates req.body against the given schema
 */
export function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true })
    if (error) {
      const details = error.details.map((d) => d.message)
      return res.status(400).json({ success: false, message: 'Validation error.', errors: details })
    }
    req.body = value
    next()
  }
}
