import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Eye, Pencil, Star, Globe, FileText, Flame, BookOpen } from 'lucide-react'
import { BlogActions } from '@/components/admin/blog-actions'

export default async function AdminBlogPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: adminRole } = await supabase.from('admin_roles').select('role').eq('user_id', user.id).single()
  if (!adminRole) redirect('/')

  const { data: posts } = await supabase
    .from('blog_posts')
    .select(`id, title, slug, status, is_featured, views, published_at, cover_image, read_time, created_at,
      blog_categories(name, slug)`)
    .order('created_at', { ascending: false })

  const published = posts?.filter(p => p.status === 'published').length ?? 0
  const drafts    = posts?.filter(p => p.status === 'draft').length ?? 0
  const featured  = posts?.filter(p => p.is_featured).length ?? 0
  const totalViews = posts?.reduce((a, p) => a + (p.views ?? 0), 0) ?? 0

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">

      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">Blog Posts</h1>
          <p className="text-muted-foreground text-sm mt-1">{posts?.length ?? 0} total posts</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground font-bold text-sm transition-all shadow-md shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> New Post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Globe,    label: 'Published', value: published,   color: 'text-primary' },
          { icon: FileText, label: 'Drafts',    value: drafts,      color: 'text-amber-500' },
          { icon: Flame,    label: 'Featured',  value: featured,    color: 'text-rose-500' },
          { icon: Eye,      label: 'Total Views', value: totalViews >= 1000 ? `${(totalViews/1000).toFixed(1)}k` : totalViews, color: 'text-blue-500' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <Icon className={`w-4.5 h-4.5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-black text-foreground">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Posts table */}
      {!posts?.length ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-border">
          <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-foreground font-bold mb-2">No posts yet</p>
          <p className="text-muted-foreground text-sm mb-6">Create your first blog post to get started.</p>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm"
          >
            <Plus className="w-4 h-4" /> Write first post
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-muted-foreground">Post</th>
                  <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-muted-foreground hidden sm:table-cell">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-muted-foreground hidden md:table-cell">Views</th>
                  <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-muted-foreground hidden lg:table-cell">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-wide text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {posts.map(post => {
                  const cat = post.blog_categories as { name: string; slug: string } | null
                  return (
                    <tr key={post.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-9 rounded-lg overflow-hidden bg-muted shrink-0 hidden sm:block">
                            {post.cover_image ? (
                              <Image src={post.cover_image} alt={post.title} fill className="object-cover" unoptimized />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="w-3.5 h-3.5 text-muted-foreground/40" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-foreground line-clamp-1 max-w-[200px]">{post.title}</p>
                              {post.is_featured && <Star className="w-3 h-3 text-amber-500 shrink-0" />}
                            </div>
                            <p className="text-xs text-muted-foreground font-mono">{post.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        {cat ? (
                          <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">{cat.name}</span>
                        ) : <span className="text-muted-foreground text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          post.status === 'published'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                        }`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views ?? 0}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
                          : new Date(post.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 justify-end">
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            title="View post"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/admin/blog/${post.id}/edit`}
                            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            title="Edit post"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>
                          <BlogActions postId={post.id} postTitle={post.title} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
