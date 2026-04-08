import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { sendFcmNotification } from '@/lib/firebase-admin'
import webpush from 'web-push'

function adminClient() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function requireAdmin() {
  const supabase = await createClient()
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await adminClient()
    .from('admin_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()
  return data ? user : null
}

function isNativeEndpoint(endpoint: string) {
  return endpoint.startsWith('native:')
}
function extractFcmToken(endpoint: string) {
  const parts = endpoint.split(':')
  return parts.slice(2).join(':')
}

const vapidReady =
  !!process.env.VAPID_SUBJECT &&
  !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
  !!process.env.VAPID_PRIVATE_KEY

if (vapidReady) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )
}

// GET — list recent broadcast campaigns (distinct title+body)
export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await adminClient()
    .from('notifications')
    .select('title, body, created_at')
    .eq('type', 'broadcast')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const map = new Map<string, { title: string; body: string; created_at: string; count: number }>()
  for (const n of data ?? []) {
    const key = `${n.title}|||${n.body}`
    const existing = map.get(key)
    if (!existing) {
      map.set(key, { title: n.title, body: n.body, created_at: n.created_at, count: 1 })
    } else {
      existing.count++
      if (n.created_at > existing.created_at) existing.created_at = n.created_at
    }
  }

  const broadcasts = Array.from(map.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return NextResponse.json({ broadcasts })
}

// POST — send a broadcast notification to an audience
export async function POST(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, body, audience } = await req.json()
  if (!title || !body) return NextResponse.json({ error: 'Title and body required' }, { status: 400 })

  const sc = adminClient()

  let profiles: { id: string }[] = []
  if (audience === 'sellers') {
    const { data } = await sc.from('profiles').select('id').eq('is_seller', true)
    profiles = data ?? []
  } else if (audience === 'verified_sellers') {
    const { data } = await sc.from('profiles').select('id').eq('seller_verified', true)
    profiles = data ?? []
  } else {
    const { data } = await sc.from('profiles').select('id')
    profiles = data ?? []
  }

  if (profiles.length === 0) return NextResponse.json({ sent: 0, push_sent: 0 })

  const userIds = profiles.map(p => p.id)

  // 1. Insert in-app notifications in batches
  const notifications = userIds.map((id) => ({
    user_id: id,
    type: 'broadcast',
    title,
    body,
    read: false,
  }))

  const BATCH = 500
  let sent = 0
  for (let i = 0; i < notifications.length; i += BATCH) {
    const { error } = await sc.from('notifications').insert(notifications.slice(i, i + BATCH))
    if (!error) sent += Math.min(BATCH, notifications.length - i)
  }

  // 2. Dispatch push notifications to subscribed devices
  let pushSent = 0
  let pushFailed = 0
  const expiredEndpoints: string[] = []

  try {
    // Fetch push subscriptions for all targeted users
    const { data: subs } = await sc
      .from('push_subscriptions')
      .select('user_id, endpoint, p256dh, auth')
      .in('user_id', userIds)

    if (subs && subs.length > 0) {
      const notifPayload = JSON.stringify({
        title,
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        url: '/dashboard/notifications',
      })

      const pushResults = await Promise.allSettled(
        subs.map(async (sub) => {
          if (isNativeEndpoint(sub.endpoint)) {
            // FCM / native push
            const fcmToken = extractFcmToken(sub.endpoint)
            const result = await sendFcmNotification(fcmToken, { title, body, url: '/dashboard/notifications' })
            return { endpoint: sub.endpoint, result }
          } else if (vapidReady) {
            // Web push
            await webpush.sendNotification(
              { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
              notifPayload
            )
            return { endpoint: sub.endpoint, result: 'sent' as const }
          }
          return { endpoint: sub.endpoint, result: 'error' as const }
        })
      )

      for (const r of pushResults) {
        if (r.status === 'fulfilled') {
          if (r.value.result === 'sent') {
            pushSent++
          } else if (r.value.result === 'invalid') {
            expiredEndpoints.push(r.value.endpoint)
            pushFailed++
          } else {
            pushFailed++
          }
        } else {
          // Web push rejected (expired/invalid subscription)
          pushFailed++
        }
      }

      // Clean up expired subscriptions
      if (expiredEndpoints.length > 0) {
        await sc.from('push_subscriptions').delete().in('endpoint', expiredEndpoints)
      }
    }
  } catch (pushErr) {
    console.error('[broadcast] Push dispatch error:', pushErr)
  }

  return NextResponse.json({ sent, push_sent: pushSent, push_failed: pushFailed })
}

// DELETE — remove all notifications for a broadcast campaign (by title + body)
export async function DELETE(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, body } = await req.json()
  if (!title || !body) return NextResponse.json({ error: 'title and body required' }, { status: 400 })

  const { error } = await adminClient()
    .from('notifications')
    .delete()
    .eq('type', 'broadcast')
    .eq('title', title)
    .eq('body', body)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
