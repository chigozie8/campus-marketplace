import { supabaseAdmin } from '../config/supabaseClient.js'
import logger from '../utils/logger.js'

export type NotificationType =
  | 'new_order'
  | 'order_paid'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_completed'
  | 'order_cancelled'
  | 'refund_processed'
  | 'new_chat_message'
  | 'system'

interface NotifyOptions {
  userId: string
  type: NotificationType
  title: string
  body: string
  data?: Record<string, unknown>
}

export async function notify(opts: NotifyOptions): Promise<void> {
  try {
    const { error } = await supabaseAdmin.from('notifications').insert({
      user_id: opts.userId,
      type: opts.type,
      title: opts.title,
      body: opts.body,
      data: opts.data ?? {},
      read: false,
    })
    if (error) {
      logger.warn(`[notify] DB insert failed: ${error.message}`)
      return
    }

    // Fire-and-forget push notification via Next.js API
    const appUrl = process.env.FRONTEND_URL ?? process.env.APP_URL ?? 'http://localhost:5000'
    fetch(`${appUrl}/api/push/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': process.env.INTERNAL_API_KEY ?? '',
      },
      body: JSON.stringify({
        userId: opts.userId,
        title: opts.title,
        body: opts.body,
        url: (opts.data?.url as string) ?? '/',
      }),
      signal: AbortSignal.timeout(5000),
    }).catch(err => logger.warn(`[notify] push delivery failed: ${err}`))
  } catch (err) {
    logger.warn(`[notify] unexpected error: ${err}`)
  }
}
