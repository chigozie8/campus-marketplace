import Redis from 'ioredis'
import logger from '../utils/logger.js'

let redis: Redis | null = null

if (process.env.REDIS_URL) {
  try {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      lazyConnect: true,
    })

    redis.on('connect', () => logger.info('Redis connected.'))
    redis.on('error', (err) => {
      logger.warn(`Redis error: ${err.message}`)
    })

    await redis.connect().catch(() => {
      logger.warn('Redis unavailable — caching disabled.')
      redis = null
    })
  } catch {
    logger.warn('Failed to initialise Redis — caching disabled.')
    redis = null
  }
} else {
  logger.info('REDIS_URL not set — running without Redis cache.')
}

export { redis }
