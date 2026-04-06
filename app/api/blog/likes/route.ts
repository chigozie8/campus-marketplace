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
  const supabase = await createServerClient()
  if (!supabase) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { postId } = await req.json()
  if (!postId) return NextResponse.json({ error: 'postId required' }, { status: 400 })

  const admin = adminClient()
  const { data: existing } = await admin
    .from('blog_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    await admin.from('blog_likes').delete().eq('id', existing.id)
    return NextResponse.json({ liked: false })
  }

  await admin.from('blog_likes').insert({ post_id: postId, user_id: user.id })
  return NextResponse.json({ liked: true })
}
