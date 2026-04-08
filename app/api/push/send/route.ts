import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

function isNativeSubscription(endpoint: string) {
  return endpoint.startsWith('native:')
}

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

    const webSubs = subs.filter((s) => !isNativeSubscription(s.endpoint))
    const nativeCount = subs.length - webSubs.length

    const payload = JSON.stringify({
      title: title || 'VendoorX',
      body: body || 'You have a new notification',
      icon: icon || '/icon-192.png',
      badge: '/icon-192.png',
      url: url || '/',
    })

    let sent = 0
    const expiredEndpoints: string[] = []

    if (webSubs.length > 0) {
      const results = await Promise.allSettled(
        webSubs.map((sub) =>
          webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
          )
        )
      )

      sent = results.filter((r) => r.status === 'fulfilled').length

      webSubs.forEach((sub, i) => {
        if (results[i].status === 'rejected') {
          expiredEndpoints.push(sub.endpoint)
        }
      })

      if (expiredEndpoints.length > 0) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .in('endpoint', expiredEndpoints)
      }
    }

    return NextResponse.json({
      sent,
      failed: expiredEndpoints.length,
      native_skipped: nativeCount,
    })
  } catch (err) {
    console.error('[push/send]', err)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
