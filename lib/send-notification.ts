import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export type NotificationType =
  | 'new_order'
  | 'order_paid'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_completed'
  | 'order_cancelled'
  | 'new_chat_message'
  | 'delivery_otp_sent'
  | 'refund_processed'
  | 'dispute_resolved'
  | 'location_update'
  | 'new_message'
  | 'verification_approved'
  | 'verification_rejected'
  | 'review'

interface SendNotificationOptions {
  userId: string
  type: NotificationType
  title: string
  body: string
  data?: Record<string, unknown>
}

export async function sendNotification(opts: SendNotificationOptions): Promise<void> {
  try {
    await adminClient.from('notifications').insert({
      user_id: opts.userId,
      type: opts.type,
      title: opts.title,
      body: opts.body,
      data: opts.data ?? {},
      read: false,
    })
  } catch (err) {
    console.error('[sendNotification] failed:', err)
  }
}

export async function sendNotifications(notifications: SendNotificationOptions[]): Promise<void> {
  if (notifications.length === 0) return
  try {
    await adminClient.from('notifications').insert(
      notifications.map(n => ({
        user_id: n.userId,
        type: n.type,
        title: n.title,
        body: n.body,
        data: n.data ?? {},
        read: false,
      })),
    )
  } catch (err) {
    console.error('[sendNotifications] failed:', err)
  }
}
