import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

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

  // Deduplicate by title+body, keeping most recent timestamp and counting recipients
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

  if (profiles.length === 0) return NextResponse.json({ sent: 0 })

  const notifications = profiles.map((p) => ({
    user_id: p.id,
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

  return NextResponse.json({ sent })
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
