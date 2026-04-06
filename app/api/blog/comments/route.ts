import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const postId = req.nextUrl.searchParams.get('post_id')
  if (!postId) return NextResponse.json({ error: 'post_id required' }, { status: 400 })

  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })

  const { data, error } = await supabase
    .from('blog_comments')
    .select('*, profiles(full_name, avatar_url)')
    .eq('post_id', postId)
    .eq('is_approved', true)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ comments: data ?? [] })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { post_id, content, parent_id, guest_name, guest_email } = body

  if (!post_id || !content?.trim()) {
    return NextResponse.json({ error: 'post_id and content required' }, { status: 400 })
  }
  if (content.trim().length > 2000) {
    return NextResponse.json({ error: 'Comment too long (max 2000 chars)' }, { status: 400 })
  }

  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })

  const { data: { user } } = await supabase.auth.getUser()

  const payload: Record<string, unknown> = {
    post_id,
    content: content.trim(),
    parent_id: parent_id || null,
    is_approved: true,
  }

  if (user) {
    payload.user_id = user.id
  } else {
    if (!guest_name?.trim()) return NextResponse.json({ error: 'Name required for guest comments' }, { status: 400 })
    payload.guest_name = guest_name.trim()
    payload.guest_email = guest_email?.trim() || null
  }

  const { data, error } = await supabase
    .from('blog_comments')
    .insert(payload)
    .select('*, profiles(full_name, avatar_url)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ comment: data })
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: adminRole } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()
  if (!adminRole) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { error } = await supabase.from('blog_comments').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
