import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { postId, content, guestName, guestEmail, parentId } = body

  if (!postId) return NextResponse.json({ error: 'postId required' }, { status: 400 })
  if (!content?.trim()) return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 })

  const supabase = await createServerClient()
  const user = supabase
    ? (await supabase.auth.getUser()).data.user
    : null

  if (!user && !guestName?.trim()) {
    return NextResponse.json({ error: 'Name is required for guest comments' }, { status: 400 })
  }

  const admin = adminClient()
  const { data, error } = await admin.from('blog_comments').insert({
    post_id: postId,
    content: content.trim(),
    user_id: user?.id || null,
    guest_name: user ? null : guestName?.trim(),
    guest_email: user ? null : guestEmail?.trim() || null,
    parent_id: parentId || null,
    is_approved: !!user,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ comment: data })
}
