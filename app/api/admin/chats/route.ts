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
    return NextResponse.json({ conversations: [], profiles: {} })
  }

  // Collect all unique user IDs to resolve profiles
  const userIds = new Set<string>()
  for (const msg of messages ?? []) {
    if (msg.sender_id) userIds.add(msg.sender_id)
    if (msg.receiver_id) userIds.add(msg.receiver_id)
  }

  // Fetch profiles with service-role client (bypasses RLS)
  const profileMap: Record<string, string> = {}
  if (userIds.size > 0) {
    const { data: profileRows } = await adminDb
      .from('profiles')
      .select('id, full_name')
      .in('id', [...userIds])

    for (const p of profileRows ?? []) {
      profileMap[p.id] = p.full_name ?? 'Unknown User'
    }
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

  return NextResponse.json({ conversations, profiles: profileMap })
}
