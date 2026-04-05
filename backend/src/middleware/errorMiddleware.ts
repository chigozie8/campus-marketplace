import { Request, Response, NextFunction } from 'express'
import { AppError } from '../types/index.js'
import logger from '../utils/logger.js'

export function notFound(req: Request, res: Response, next: NextFunction): void {
  const error: AppError = new Error(`Route not found: ${req.method} ${req.originalUrl}`)
  error.status = 404
  next(error)
}

export function errorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction): void {
  const statusCode = err.status ?? err.statusCode ?? 500
  const isProduction = process.env.NODE_ENV === 'production'

  logger.error(`[${statusCode}] ${err.message}`, { stack: err.stack })

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(isProduction ? {} : { error: err.stack }),
  })
}
