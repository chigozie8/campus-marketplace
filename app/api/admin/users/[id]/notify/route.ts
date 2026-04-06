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

  const { title, body } = await req.json()
  if (!title || !body) return NextResponse.json({ error: 'Title and body required' }, { status: 400 })

  const { error } = await adminClient.from('notifications').insert({
    user_id: targetUserId,
    type: 'admin_message',
    title,
    body,
    read: false,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
