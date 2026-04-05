import 'dotenv/config'
import app from './app.js'
import logger from './utils/logger.js'

const PORT = process.env.PORT || 3001

const server = app.listen(PORT, () => {
  logger.info(`VendorX API running on port ${PORT} [${process.env.NODE_ENV ?? 'development'}]`)
})

// ─── GRACEFUL SHUTDOWN ────────────────────────────────────────────────────────
function shutdown(signal) {
  logger.info(`${signal} received. Shutting down gracefully...`)
  server.close(() => {
    logger.info('HTTP server closed.')
    process.exit(0)
  })

  // Force exit if server hasn't closed within 10s
  setTimeout(() => {
    logger.error('Forced shutdown after timeout.')
    process.exit(1)
  }, 10_000)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection:', reason)
})

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err)
  shutdown('uncaughtException')
})
