import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit, clientIp } from '@/lib/rate-limit'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req)

  // Rate limit: 10 comments per IP per hour (generous for legit users, blocks spam)
  const ipLimit = await rateLimit({
    key: `blog-comment:ip:${ip}`,
    limit: 10,
    windowSeconds: 3600,
  })
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many comments. Please try again later.' },
      { status: 429 },
    )
  }

  const body = await req.json()
  const { postId, content, guestName, guestEmail, parentId } = body

  if (!postId) return NextResponse.json({ error: 'postId required' }, { status: 400 })
  if (!content?.trim()) return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 })

  const supabase = await createServerClient()
  const user = supabase
    ? (await supabase.auth.getUser()).data.user
    : null

  // Additional rate limit per user/email to prevent single-user spam
  const userKey = user?.id || guestEmail?.toLowerCase() || ip
  const userLimit = await rateLimit({
    key: `blog-comment:user:${userKey}`,
    limit: 5,
    windowSeconds: 1800, // 5 comments per 30 minutes per user
  })
  if (!userLimit.allowed) {
    return NextResponse.json(
      { error: 'You are commenting too frequently. Please slow down.' },
      { status: 429 },
    )
  }

  if (!user && !guestName?.trim()) {
    return NextResponse.json({ error: 'Name is required for guest comments' }, { status: 400 })
  }

  const adminClient = createServiceClient()
  if (!adminClient) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

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
