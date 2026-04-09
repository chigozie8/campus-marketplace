import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function getAdminUser() {
  const supabase = await createClient()
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: role } = await adminDb.from('admin_roles').select('role').eq('user_id', user.id).single()
  return role ? user : null
}

export async function GET() {
  const adminUser = await getAdminUser()
  if (!adminUser) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: messages, error } = await adminDb
    .from('order_chats')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    // Table may not exist yet
    return NextResponse.json({ conversations: [] })
  }

  // Group by order_id
  const grouped: Record<string, typeof messages> = {}
  for (const msg of messages ?? []) {
    if (!grouped[msg.order_id]) grouped[msg.order_id] = []
    grouped[msg.order_id].push(msg)
  }

  const conversations = Object.entries(grouped)
    .map(([orderId, msgs]) => ({
      orderId,
      messages: msgs,
      lastMessage: msgs[msgs.length - 1],
      unread: msgs.filter(m => !m.read).length,
    }))
    .sort((a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime())

  return NextResponse.json({ conversations })
}
