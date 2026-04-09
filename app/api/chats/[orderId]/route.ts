import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { sendNotification } from '@/lib/send-notification'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function ensureTable() {
  await adminDb.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS order_chats (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id    UUID NOT NULL,
        sender_id   UUID NOT NULL,
        receiver_id UUID NOT NULL,
        message     TEXT NOT NULL,
        read        BOOLEAN NOT NULL DEFAULT FALSE,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS order_chats_order_idx ON order_chats (order_id);
      CREATE INDEX IF NOT EXISTS order_chats_receiver_idx ON order_chats (receiver_id, read);
    `,
  }).catch(() => {
    // rpc may not exist — try direct insert instead; table might already exist
  })
}

/** Verify caller is buyer or seller of this order */
async function getOrderParties(orderId: string, userId: string) {
  const { data: order } = await adminDb
    .from('orders')
    .select('buyer_id, seller_id')
    .eq('id', orderId)
    .single()
  if (!order) return null
  if (order.buyer_id !== userId && order.seller_id !== userId) return null
  return order
}

// GET /api/chats/[orderId]  — fetch messages
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const order = await getOrderParties(orderId, user.id)
  if (!order) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: messages } = await adminDb
    .from('order_chats')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true })
    .limit(200)

  // Mark messages sent TO this user as read
  await adminDb
    .from('order_chats')
    .update({ read: true })
    .eq('order_id', orderId)
    .eq('receiver_id', user.id)
    .eq('read', false)

  return NextResponse.json({ messages: messages ?? [] })
}

// POST /api/chats/[orderId]  — send a message
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const order = await getOrderParties(orderId, user.id)
  if (!order) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { message } = await req.json()
  if (!message?.trim()) return NextResponse.json({ error: 'Message is required' }, { status: 400 })

  await ensureTable()

  const receiverId = order.buyer_id === user.id ? order.seller_id : order.buyer_id

  const { data: inserted, error } = await adminDb
    .from('order_chats')
    .insert({
      order_id: orderId,
      sender_id: user.id,
      receiver_id: receiverId,
      message: message.trim(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send in-app notification to receiver
  const { data: senderProfile } = await adminDb
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const senderName = senderProfile?.full_name ?? 'Someone'

  await sendNotification({
    userId: receiverId,
    type: 'new_chat_message',
    title: `New message from ${senderName}`,
    body: message.trim().slice(0, 80) + (message.trim().length > 80 ? '…' : ''),
    data: { orderId, senderId: user.id },
  })

  return NextResponse.json({ message: inserted })
}
