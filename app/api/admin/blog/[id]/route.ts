import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: adminRole } = await supabase.from('admin_roles').select('role').eq('user_id', user.id).single()
  if (!adminRole) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { error } = await supabase.from('blog_posts').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: adminRole } = await supabase.from('admin_roles').select('role').eq('user_id', user.id).single()
  if (!adminRole) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { error, data } = await supabase.from('blog_posts').update(body).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ post: data })
}
