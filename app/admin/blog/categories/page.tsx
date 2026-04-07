import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Tag } from 'lucide-react'
import { BlogCategoriesClient } from '@/components/admin/blog-categories-client'

export const metadata = { title: 'Blog Categories — VendoorX Admin' }

export default async function AdminBlogCategoriesPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: adminRole } = await supabase.from('admin_roles').select('role').eq('user_id', user.id).single()
  if (!adminRole) redirect('/')

  const { data: categories } = await supabase
    .from('blog_categories')
    .select('id, name, slug, color, created_at')
    .order('name')

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/blog"
          className="p-2 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" /> Blog Categories
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {categories?.length ?? 0} {(categories?.length ?? 0) === 1 ? 'category' : 'categories'}
          </p>
        </div>
      </div>

      <BlogCategoriesClient initialCategories={categories ?? []} />
    </div>
  )
}
