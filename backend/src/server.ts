import 'dotenv/config'
import app from './app.js'
import logger from './utils/logger.js'
import { startAutoReleaseJob } from './jobs/escrowAutoRelease.js'
import { startAutoCancelJob } from './jobs/autoCancelOrders.js'
import { startLocationCleanupJob } from './jobs/locationCleanup.js'
import { startCartAbandonmentJob } from './jobs/cartAbandonmentJob.js'
import { startInactivityJob } from './jobs/inactivityJob.js'
import { startWeeklySellerDigestJob } from './jobs/weeklySellerDigest.js'
import { startProfileCompletionJob } from './jobs/profileCompletionJob.js'
import { startSellerActivationJob } from './jobs/sellerActivationJob.js'
import { startReviewRequestJob } from './jobs/reviewRequestJob.js'
import { startPayoutReminderJob } from './jobs/payoutReminderJob.js'
import { initDb } from './config/db.js'

const PORT = Number(process.env.PORT) || 3001

// INTERNAL_API_KEY is required for backend → Next.js service-to-service calls
// (delivery OTP emails, milestone checks, push notifications, etc.). The host
// for those calls is INTERNAL_APP_URL when set, otherwise localhost:5000 (the
// in-container default that works in dev and in single-deploy production).
// FRONTEND_URL is for user-facing URLs only (Paystack callback, bot links).
if (!process.env.INTERNAL_API_KEY) {
  logger.warn('[startup] INTERNAL_API_KEY is not set — backend → Next.js internal calls (OTP emails, milestones, push) will fail')
}

initDb()
  .then(() => {
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`VendorX API v2 running on port ${PORT} [${process.env.NODE_ENV ?? 'development'}]`)
      logger.info(`API docs: http://localhost:${PORT}/api/docs`)
      startAutoReleaseJob()
      startAutoCancelJob()
      startLocationCleanupJob()
      startCartAbandonmentJob()
      startInactivityJob()
      startWeeklySellerDigestJob()
      startProfileCompletionJob()
      startSellerActivationJob()
      startReviewRequestJob()
      startPayoutReminderJob()
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
  })
  .catch((err) => {
    logger.error('[startup] Failed to initialize database:', err)
    process.exit(1)
  })
