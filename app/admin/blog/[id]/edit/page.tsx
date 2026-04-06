import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { BlogPostEditor } from '@/components/admin/blog-post-editor'

export const metadata: Metadata = { title: 'Edit Blog Post' }

export default async function AdminBlogEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const [{ data: post }, { data: categories }] = await Promise.all([
    supabase.from('blog_posts').select('*').eq('id', id).single(),
    supabase.from('blog_categories').select('id, name, slug').order('name'),
  ])

  if (!post) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-foreground">Edit Post</h1>
        <p className="text-sm text-muted-foreground mt-0.5 truncate max-w-xl">{post.title}</p>
      </div>
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
          is_featured: post.is_featured,
          read_time: post.read_time ?? 5,
          seo_title: post.seo_title ?? '',
          seo_description: post.seo_description ?? '',
        }}
      />
    </div>
  )
}
