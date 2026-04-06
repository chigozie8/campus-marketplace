import { Queue, Worker, Job } from 'bullmq'
import { redis } from '../config/redisClient.js'
import logger from '../utils/logger.js'

interface MessageJob {
  from: string
  text: string
  platform?: 'whatsapp' | 'instagram' | 'facebook'
}

let messageQueue: Queue | null = null

if (redis) {
  messageQueue = new Queue('messages', {
    connection: redis,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    },
  })

  const worker = new Worker<MessageJob>(
    'messages',
    async (job: Job<MessageJob>) => {
      const { from, text } = job.data
      logger.info(`[messageQueue] Processing message from ${from}: "${text}"`)

      const { handleIncomingMessage } = await import('../bots/messageHandler.js')
      await handleIncomingMessage(from, text)
    },
    { connection: redis, concurrency: 5 }
  )

  worker.on('completed', (job) => logger.debug(`[messageQueue] Job ${job.id} completed`))
  worker.on('failed', (job, err) => logger.error(`[messageQueue] Job ${job?.id} failed: ${err.message}`))
}

export async function addMessageJob(data: MessageJob): Promise<void> {
  if (messageQueue) {
    await messageQueue.add('processMessage', data, { priority: 1 })
  } else {
    logger.info(`[messageQueue] Inline processing (no Redis): message from ${data.from}`)
    const { handleIncomingMessage } = await import('../bots/messageHandler.js')
    await handleIncomingMessage(data.from, data.text).catch((err) =>
      logger.error(`[messageQueue] Inline handler error: ${err.message}`)
    )
  }
}

export { messageQueue }
