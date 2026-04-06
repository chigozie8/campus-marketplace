import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BlogPostEditor } from '@/components/admin/blog-post-editor'

export const metadata: Metadata = { title: 'New Blog Post' }

export default async function AdminBlogNewPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const { data: categories } = await supabase.from('blog_categories').select('id, name, slug').order('name')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-foreground">New Blog Post</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Write and publish a new article</p>
      </div>
      <BlogPostEditor categories={categories ?? []} mode="create" />
    </div>
  )
}
