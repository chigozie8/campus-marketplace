import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { sendFcmNotification } from '@/lib/firebase-admin'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

interface PushSubscription {
  endpoint: string
  p256dh: string
  auth: string
}

function isNativeEndpoint(endpoint: string): boolean {
  return endpoint.startsWith('native:')
}

function extractFcmToken(endpoint: string): string {
  // Format: native:{platform}:{fcmToken}  — token may itself contain colons
  const parts = endpoint.split(':')
  return parts.slice(2).join(':')
}

export async function POST(req: Request) {
  try {
    // Two ways in:
    //   1. Backend service-to-service: presents `x-internal-key` matching
    //      INTERNAL_API_KEY. We then trust `userId` in the body and target
    //      that user's push subscriptions directly. No session required.
    //   2. Browser: authenticated user. Falls back to their own id when no
    //      `userId` is provided. Cannot push to OTHER users from the browser.
    const internalKeyHeader = req.headers.get('x-internal-key') ?? ''
    const expectedInternalKey = process.env.INTERNAL_API_KEY ?? ''
    const isInternalCall = !!expectedInternalKey && internalKeyHeader === expectedInternalKey

    const supabase = await createClient()
    let callerId: string | null = null
    if (!isInternalCall) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      callerId = user.id
    }

    const { userId, title, body, url, icon } = await req.json()
    const targetId = userId || callerId
    if (!targetId) {
      return NextResponse.json({ error: 'Missing userId for internal push call.' }, { status: 400 })
    }
    // Browser callers can ONLY push to themselves. Internal-key callers may
    // target any user (that's the whole point — backend dispatches notifs).
    if (!isInternalCall && userId && userId !== callerId) {
      return NextResponse.json({ error: 'Forbidden: cannot push to another user.' }, { status: 403 })
    }

    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', targetId)

    if (!subs || subs.length === 0) {
      return NextResponse.json({ sent: 0, native_sent: 0, failed: 0 })
    }

    const webSubs = (subs as PushSubscription[]).filter((s) => !isNativeEndpoint(s.endpoint))
    const nativeSubs = (subs as PushSubscription[]).filter((s) => isNativeEndpoint(s.endpoint))

    const notifPayload = {
      title: title || 'VendoorX',
      body: body || 'You have a new notification',
      icon: icon || '/icon-192.png',
      url: url || '/',
    }

    // --- Web push delivery ---
    const webPayload = JSON.stringify({
      ...notifPayload,
      badge: '/icon-192.png',
    })

    let webSent = 0
    const expiredEndpoints: string[] = []

    if (webSubs.length > 0) {
      const results = await Promise.allSettled(
        webSubs.map((sub) =>
          webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            webPayload
          )
        )
      )

      webSubs.forEach((sub, i) => {
        if (results[i].status === 'fulfilled') {
          webSent++
        } else {
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

    // --- Native push delivery via FCM ---
    let nativeSent = 0
    const invalidNativeEndpoints: string[] = []

    if (nativeSubs.length > 0) {
      const fcmResults = await Promise.allSettled(
        nativeSubs.map(async (sub) => {
          const fcmToken = extractFcmToken(sub.endpoint)
          const result = await sendFcmNotification(fcmToken, notifPayload)
          return { endpoint: sub.endpoint, result }
        })
      )

      fcmResults.forEach((r) => {
        if (r.status === 'fulfilled') {
          if (r.value.result === 'sent') {
            nativeSent++
          } else if (r.value.result === 'invalid') {
            invalidNativeEndpoints.push(r.value.endpoint)
          }
        }
      })

      if (invalidNativeEndpoints.length > 0) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .in('endpoint', invalidNativeEndpoints)
      }
    }

    return NextResponse.json({
      sent: webSent,
      native_sent: nativeSent,
      failed: expiredEndpoints.length + invalidNativeEndpoints.length,
    })
  } catch (err) {
    console.error('[push/send]', err)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
