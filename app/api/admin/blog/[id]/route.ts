import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { revalidateTag } from 'next/cache'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

async function requireAdmin() {
  const supabase = await createServerClient()
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('admin_roles').select('role').eq('user_id', user.id).single()
  return data ? user : null
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const { data, error } = await adminClient()
    .from('blog_posts')
    .select(`*, blog_categories(id, name, slug)`)
    .eq('id', id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ post: data })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await req.json()

  const updates: Record<string, unknown> = {}
  const fields = [
    'title', 'slug', 'content', 'excerpt', 'cover_image', 'category_id',
    'tags', 'status', 'is_featured', 'read_time', 'seo_title', 'seo_description',
  ]
  for (const f of fields) {
    if (f in body) updates[f] = body[f]
  }

  if (body.status === 'published') {
    const { data: existing } = await adminClient().from('blog_posts').select('published_at').eq('id', id).single()
    if (!existing?.published_at) updates.published_at = new Date().toISOString()
  }

  const { data, error } = await adminClient()
    .from('blog_posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidateTag('blog-posts', 'max')
  return NextResponse.json({ post: data })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const { error } = await adminClient().from('blog_posts').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidateTag('blog-posts', 'max')
  return NextResponse.json({ ok: true })
}
