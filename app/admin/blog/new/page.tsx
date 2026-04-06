import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { BlogPostEditor } from '@/components/admin/blog-post-editor'

export default async function NewBlogPostPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: adminRole } = await supabase.from('admin_roles').select('role').eq('user_id', user.id).single()
  if (!adminRole) redirect('/')

  const { data: categories } = await supabase
    .from('blog_categories')
    .select('id, name, slug')
    .order('name')

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
        <h1 className="text-sm font-bold text-foreground">New Post</h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <BlogPostEditor categories={categories ?? []} mode="create" />
      </div>
    </div>
  )
}
