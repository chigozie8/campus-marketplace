import { z } from 'zod'
import { Request, Response, NextFunction } from 'express'
import { AppError } from '../types/index.js'

export const registerSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters.').max(100),
  role: z.enum(['buyer', 'vendor'], { message: 'Role must be buyer or vendor.' }),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(1, 'Password is required.'),
})

export function validate(schema: z.ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const message = result.error.errors.map((e) => e.message).join(', ')
      const err: AppError = new Error(message)
      err.status = 422
      next(err)
      return
    }
    req.body = result.data
    next()
  }
}
