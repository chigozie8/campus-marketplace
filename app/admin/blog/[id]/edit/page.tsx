import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { BlogPostEditor } from '@/components/admin/blog-post-editor'

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: adminRole } = await supabase.from('admin_roles').select('role').eq('user_id', user.id).single()
  if (!adminRole) redirect('/')

  const [{ data: post }, { data: categories }] = await Promise.all([
    supabase.from('blog_posts')
      .select('*')
      .eq('id', id)
      .single(),
    supabase.from('blog_categories').select('id, name, slug').order('name'),
  ])

  if (!post) notFound()

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-4 px-6 py-4 border-b border-border">
        <Link
          href="/admin/blog"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> All posts
        </Link>
        <div className="w-px h-4 bg-border" />
        <h1 className="text-sm font-bold text-foreground truncate">Editing: {post.title}</h1>
        {post.status === 'published' && (
          <Link
            href={`/blog/${post.slug}`}
            target="_blank"
            className="ml-auto text-xs text-primary hover:underline"
          >
            View live →
          </Link>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <BlogPostEditor
          categories={categories ?? []}
          mode="edit"
          initialData={{
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt ?? '',
            content: post.content,
            cover_image: post.cover_image ?? '',
            category_id: post.category_id ?? '',
            tags: post.tags ?? [],
            status: post.status,
            is_featured: post.is_featured ?? false,
            read_time: post.read_time ?? 5,
            seo_title: post.seo_title ?? '',
            seo_description: post.seo_description ?? '',
          }}
        />
      </div>
    </div>
  )
}
