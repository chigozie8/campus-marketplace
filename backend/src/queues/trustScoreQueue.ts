import { Queue, Worker, Job } from 'bullmq'
import { redis } from '../config/redisClient.js'
import logger from '../utils/logger.js'

export type TrustScoreJobType = 'order_completed' | 'order_failed' | 'dispute_created' | 'rating_submitted'

export interface TrustScoreJob {
  type: TrustScoreJobType
  vendorId: string
  payload?: { rating?: number }
}

let trustScoreQueue: Queue | null = null

if (redis) {
  trustScoreQueue = new Queue('trust-score', {
    connection: redis,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 3000 },
      removeOnComplete: 300,
      removeOnFail: 100,
    },
  })

  const worker = new Worker<TrustScoreJob>(
    'trust-score',
    async (job: Job<TrustScoreJob>) => {
      const { type, vendorId, payload } = job.data
      const ts = await import('../services/trustScoreService.js')

      switch (type) {
        case 'order_completed':
          await ts.onOrderCompleted(vendorId)
          break
        case 'order_failed':
          await ts.onOrderFailed(vendorId)
          break
        case 'dispute_created':
          await ts.onDisputeCreated(vendorId)
          break
        case 'rating_submitted':
          await ts.onRatingSubmitted(vendorId, payload?.rating ?? 0)
          break
        default:
          logger.warn(`[trustScoreQueue] Unknown job type: ${type}`)
      }
    },
    { connection: redis, concurrency: 5 },
  )

  worker.on('completed', (job) => logger.debug(`[trustScoreQueue] Job ${job.id} (${job.data.type}) completed`))
  worker.on('failed', (job, err) => logger.error(`[trustScoreQueue] Job ${job?.id} failed: ${err.message}`))
}

/**
 * Enqueue a trust score recalculation.
 * Falls back to inline execution if Redis is not available.
 */
export async function addTrustScoreJob(data: TrustScoreJob): Promise<void> {
  if (trustScoreQueue) {
    await trustScoreQueue.add('recalculate', data, {
      jobId: `trust:${data.type}:${data.vendorId}:${Date.now()}`,
    })
  } else {
    logger.info(`[trustScoreQueue] Inline execution: ${data.type} for vendor ${data.vendorId}`)
    const ts = await import('../services/trustScoreService.js')
    switch (data.type) {
      case 'order_completed': await ts.onOrderCompleted(data.vendorId); break
      case 'order_failed':    await ts.onOrderFailed(data.vendorId);    break
      case 'dispute_created': await ts.onDisputeCreated(data.vendorId); break
      case 'rating_submitted':
        await ts.onRatingSubmitted(data.vendorId, data.payload?.rating ?? 0)
        break
    }
  }
}

export { trustScoreQueue }
