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

export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await adminClient()
    .from('blog_posts')
    .select(`id, title, slug, status, is_featured, views, published_at, cover_image, read_time, created_at, tags,
      blog_categories(name, slug)`)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ posts: data })
}

export async function POST(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const {
    title, slug, content, excerpt, cover_image, category_id, tags,
    status, is_featured, read_time, seo_title, seo_description,
  } = body

  if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  if (!content?.trim()) return NextResponse.json({ error: 'Content is required' }, { status: 400 })

  const cleanSlug = (slug || title)
    .trim().toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 100)

  const { data, error } = await adminClient().from('blog_posts').insert({
    title: title.trim(),
    slug: cleanSlug,
    content: content.trim(),
    excerpt: excerpt?.trim() || null,
    cover_image: cover_image || null,
    category_id: category_id || null,
    tags: tags || [],
    status: status || 'draft',
    is_featured: is_featured || false,
    read_time: read_time || 5,
    seo_title: seo_title?.trim() || null,
    seo_description: seo_description?.trim() || null,
    author_id: user.id,
    published_at: status === 'published' ? new Date().toISOString() : null,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidateTag('blog-posts')
  return NextResponse.json({ post: data })
}
