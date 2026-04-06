import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: adminRole } = await adminClient
    .from('admin_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!adminRole) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, body, audience } = await req.json()
  if (!title || !body) return NextResponse.json({ error: 'Title and body required' }, { status: 400 })

  let profileQuery = adminClient.from('profiles').select('id, is_seller, seller_verified')

  let profiles: any[] = []
  if (audience === 'sellers') {
    const { data } = await adminClient.from('profiles').select('id').eq('is_seller', true)
    profiles = data ?? []
  } else if (audience === 'verified_sellers') {
    const { data } = await adminClient.from('profiles').select('id').eq('seller_verified', true)
    profiles = data ?? []
  } else {
    const { data } = await adminClient.from('profiles').select('id')
    profiles = data ?? []
  }

  if (profiles.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  const notifications = profiles.map((p: any) => ({
    user_id: p.id,
    type: 'broadcast',
    title,
    body,
    read: false,
  }))

  const BATCH = 500
  let sent = 0
  for (let i = 0; i < notifications.length; i += BATCH) {
    const { error } = await adminClient.from('notifications').insert(notifications.slice(i, i + BATCH))
    if (!error) sent += Math.min(BATCH, notifications.length - i)
  }

  return NextResponse.json({ sent })
}
