import logger from '../utils/logger.js'

/**
 * 404 handler — must be registered AFTER all routes
 */
export function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`)
  error.status = 404
  next(error)
}

/**
 * Centralised error handler — must be the last middleware
 */
export function errorHandler(err, req, res, next) {
  const statusCode = err.status || err.statusCode || 500
  const isProduction = process.env.NODE_ENV === 'production'

  logger.error(`[${statusCode}] ${err.message}`, { stack: err.stack })

  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(isProduction ? {} : { error: err.stack }),
  })
}
