import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function assertAdmin(req: NextRequest) {
  const supabase = await createClient()
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: role } = await adminClient
    .from('admin_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()
  return role ? user : null
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: targetUserId } = await params
  const admin = await assertAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { action, reason } = await req.json()

  if (action === 'block') {
    const { error } = await adminClient
      .from('profiles')
      .update({
        is_blocked: true,
        blocked_at: new Date().toISOString(),
        blocked_reason: typeof reason === 'string' ? reason : null,
      })
      .eq('id', targetUserId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Notify the blocked user so they understand why actions fail
    await adminClient.from('notifications').insert({
      user_id: targetUserId,
      title: 'Account restricted',
      body: 'Your account has been restricted by an admin. You can still browse and place orders, but you cannot create new listings or withdraw funds. Contact support if you believe this is a mistake.',
      type: 'info',
      data: { url: '/help' },
    })

    return NextResponse.json({ blocked: true })
  }

  if (action === 'unblock') {
    const { error } = await adminClient
      .from('profiles')
      .update({
        is_blocked: false,
        blocked_at: null,
        blocked_reason: null,
      })
      .eq('id', targetUserId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await adminClient.from('notifications').insert({
      user_id: targetUserId,
      title: 'Account restored',
      body: 'Your account restrictions have been lifted. You can now create listings and withdraw funds again. Welcome back!',
      type: 'info',
      data: { url: '/dashboard' },
    })

    return NextResponse.json({ blocked: false })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
