import { Queue, Worker, Job } from 'bullmq'
import { redis } from '../config/redisClient.js'
import logger from '../utils/logger.js'

interface NotificationJob {
  type: 'whatsapp' | 'email'
  to: string
  message: string
}

let notificationQueue: Queue | null = null

if (redis) {
  notificationQueue = new Queue('notifications', {
    connection: redis,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'fixed', delay: 5000 },
      removeOnComplete: 200,
      removeOnFail: 100,
    },
  })

  const worker = new Worker<NotificationJob>(
    'notifications',
    async (job: Job<NotificationJob>) => {
      const { type, to, message } = job.data
      logger.info(`[notificationQueue] Sending ${type} to ${to}`)

      if (type === 'whatsapp') {
        const { sendMessage } = await import('../services/whatsappService.js')
        await sendMessage(to, message)
      } else {
        logger.info(`[notificationQueue] Email notification (${to}): ${message}`)
      }
    },
    { connection: redis, concurrency: 5 }
  )

  worker.on('completed', (job) => logger.debug(`[notificationQueue] Job ${job.id} completed`))
  worker.on('failed', (job, err) => logger.error(`[notificationQueue] Job ${job?.id} failed: ${err.message}`))
}

export async function addNotificationJob(data: NotificationJob): Promise<void> {
  if (notificationQueue) {
    await notificationQueue.add('sendNotification', data)
  } else {
    logger.info(`[notificationQueue] Inline: ${data.type} to ${data.to}`)
    if (data.type === 'whatsapp') {
      const { sendMessage } = await import('../services/whatsappService.js')
      await sendMessage(data.to, data.message).catch((err) =>
        logger.error(`[notificationQueue] Inline WhatsApp error: ${err.message}`)
      )
    }
  }
}

export { notificationQueue }
