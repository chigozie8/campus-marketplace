import 'dotenv/config'
import app from './app.js'
import logger from './utils/logger.js'
import { startAutoReleaseJob } from './jobs/escrowAutoRelease.js'

const PORT = Number(process.env.PORT) || 3001

const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`VendorX API v2 running on port ${PORT} [${process.env.NODE_ENV ?? 'development'}]`)
  logger.info(`API docs: http://localhost:${PORT}/api/docs`)
  startAutoReleaseJob()
})

function shutdown(signal: string): void {
  logger.info(`${signal} received. Shutting down gracefully...`)
  server.close(() => {
    logger.info('HTTP server closed.')
    process.exit(0)
  })
  setTimeout(() => {
    logger.error('Forced shutdown after timeout.')
    process.exit(1)
  }, 10_000)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('unhandledRejection', (reason) => logger.error('Unhandled Promise Rejection:', reason))
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err)
  shutdown('uncaughtException')
})
