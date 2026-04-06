import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: adminRole } = await supabase.from('admin_roles').select('role').eq('user_id', user.id).single()
  if (!adminRole) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { title, slug, content, excerpt, cover_image, category_id, tags, status, is_featured, read_time, seo_title, seo_description } = body

  if (!title?.trim() || !slug?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'title, slug and content are required' }, { status: 400 })
  }

  const payload: Record<string, unknown> = {
    title: title.trim(),
    slug: slug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    content: content.trim(),
    excerpt: excerpt?.trim() || null,
    cover_image: cover_image?.trim() || null,
    category_id: category_id || null,
    tags: tags || [],
    status: status || 'draft',
    is_featured: !!is_featured,
    read_time: parseInt(read_time) || 5,
    seo_title: seo_title?.trim() || null,
    seo_description: seo_description?.trim() || null,
    author_id: user.id,
    published_at: status === 'published' ? new Date().toISOString() : null,
  }

  const { data, error } = await supabase.from('blog_posts').insert(payload).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ post: data })
}
