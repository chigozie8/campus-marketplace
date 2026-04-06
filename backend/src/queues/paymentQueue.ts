import { Queue, Worker, Job } from 'bullmq'
import { redis } from '../config/redisClient.js'
import logger from '../utils/logger.js'

interface PaymentJob {
  reference: string
  status: string
}

let paymentQueue: Queue | null = null

if (redis) {
  paymentQueue = new Queue('payments', {
    connection: redis,
    defaultJobOptions: {
      attempts: 5,
      backoff: { type: 'exponential', delay: 3000 },
      removeOnComplete: 200,
      removeOnFail: 100,
    },
  })

  const worker = new Worker<PaymentJob>(
    'payments',
    async (job: Job<PaymentJob>) => {
      const { reference, status } = job.data
      logger.info(`[paymentQueue] Processing payment reference=${reference}, status=${status}`)

      const { getOrderByReference, updateOrderStatus } = await import('../services/orderService.js')
      const order = await getOrderByReference(reference)

      if (order && order.status === 'pending' && status === 'success') {
        await updateOrderStatus(order.id, 'paid')
        logger.info(`[paymentQueue] Order ${order.id} marked as paid.`)

        // Credit seller's wallet (pending until delivery confirmed)
        try {
          const { creditSellerPending } = await import('../services/walletService.js')
          await creditSellerPending(order.seller_id, order.id, order.total_amount)
        } catch (err) {
          logger.error(`[paymentQueue] Wallet credit failed for order ${order.id}: ${err}`)
        }
      } else {
        logger.warn(`[paymentQueue] Order not updated — status="${status}", order_status="${order?.status ?? 'not found'}"`)
      }
    },
    { connection: redis, concurrency: 3 }
  )

  worker.on('completed', (job) => logger.debug(`[paymentQueue] Job ${job.id} completed`))
  worker.on('failed', (job, err) => logger.error(`[paymentQueue] Job ${job?.id} failed: ${err.message}`))
}

export async function addPaymentJob(data: PaymentJob): Promise<void> {
  if (paymentQueue) {
    await paymentQueue.add('processPayment', data, { jobId: `pay:${data.reference}` })
  } else {
    logger.info(`[paymentQueue] Inline processing (no Redis): reference=${data.reference}`)
    const { getOrderByReference, updateOrderStatus } = await import('../services/orderService.js')
    const order = await getOrderByReference(data.reference)
    if (order && order.status === 'pending' && data.status === 'success') {
      await updateOrderStatus(order.id, 'paid')
      try {
        const { creditSellerPending } = await import('../services/walletService.js')
        await creditSellerPending(order.seller_id, order.id, order.total_amount)
      } catch (err) {
        logger.error(`[paymentQueue] Inline wallet credit failed: ${err}`)
      }
    }
  }
}

export { paymentQueue }
