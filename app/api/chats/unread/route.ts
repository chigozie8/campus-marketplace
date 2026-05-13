import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// GET /api/chats/unread — fetch unread message count
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: unreadChats } = await adminDb
    .from('order_chats')
    .select('id', { count: 'exact', head: true })
    .eq('receiver_id', user.id)
    .eq('read', false)

  return NextResponse.json({ unreadCount: unreadChats?.length ?? 0 })
}
