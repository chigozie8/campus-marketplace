import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: targetUserId } = await params

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

  const { action } = await req.json()

  const { data: targetUser, error: fetchErr } = await adminClient.auth.admin.getUserById(targetUserId)
  if (fetchErr || !targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const isBanned = targetUser.user.banned_until &&
    new Date(targetUser.user.banned_until) > new Date()

  if (action === 'ban' && !isBanned) {
    const { error } = await adminClient.auth.admin.updateUserById(targetUserId, {
      ban_duration: '876600h',
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ banned: true })
  } else if (action === 'unban') {
    const { error } = await adminClient.auth.admin.updateUserById(targetUserId, {
      ban_duration: 'none',
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ banned: false })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: targetUserId } = await params

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

  const { data: targetUser, error } = await adminClient.auth.admin.getUserById(targetUserId)
  if (error || !targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const isBanned = targetUser.user.banned_until &&
    new Date(targetUser.user.banned_until) > new Date()

  return NextResponse.json({ banned: !!isBanned, banned_until: targetUser.user.banned_until })
}
