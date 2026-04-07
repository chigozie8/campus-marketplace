import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { userId, title, body, url, icon } = await req.json()

    const targetId = userId || user.id

    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', targetId)

    if (!subs || subs.length === 0) {
      return NextResponse.json({ sent: 0 })
    }

    const payload = JSON.stringify({
      title: title || 'VendoorX',
      body: body || 'You have a new notification',
      icon: icon || '/icon-192.png',
      badge: '/icon-192.png',
      url: url || '/',
    })

    const results = await Promise.allSettled(
      subs.map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        )
      )
    )

    const sent = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected')

    if (failed.length > 0) {
      const expiredEndpoints = subs
        .filter((_, i) => results[i].status === 'rejected')
        .map((s) => s.endpoint)

      if (expiredEndpoints.length > 0) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .in('endpoint', expiredEndpoints)
      }
    }

    return NextResponse.json({ sent, failed: failed.length })
  } catch (err) {
    console.error('[push/send]', err)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
