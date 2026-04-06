import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Plus, Edit3, Eye, Trash2, BookOpen, CheckCircle2, Clock, Star } from 'lucide-react'
import { AdminBlogActions } from '@/components/admin/blog-actions'

export const metadata: Metadata = { title: 'Blog Management' }

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function AdminBlogPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select(`id, title, slug, status, is_featured, views, published_at, cover_image, read_time,
      blog_categories(name, slug),
      blog_likes(count), blog_comments(count)`)
    .order('created_at', { ascending: false })

  const total = posts?.length ?? 0
  const published = posts?.filter(p => p.status === 'published').length ?? 0
  const drafts = posts?.filter(p => p.status === 'draft').length ?? 0
  const featured = posts?.filter(p => p.is_featured).length ?? 0

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">Blog Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Create and manage blog posts</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          New Post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Posts', value: total, icon: BookOpen, color: 'text-violet-600 bg-violet-100 dark:bg-violet-950/40' },
          { label: 'Published', value: published, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/40' },
          { label: 'Drafts', value: drafts, icon: Clock, color: 'text-amber-600 bg-amber-100 dark:bg-amber-950/40' },
          { label: 'Featured', value: featured, icon: Star, color: 'text-blue-600 bg-blue-100 dark:bg-blue-950/40' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Posts Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {!posts?.length ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="font-bold text-foreground mb-2">No blog posts yet</p>
            <p className="text-sm text-muted-foreground mb-4">Create your first post to get started.</p>
            <Link href="/admin/blog/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90">
              <Plus className="w-4 h-4" /> Create Post
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-5 py-3.5 font-bold text-xs text-muted-foreground uppercase tracking-wide">Post</th>
                  <th className="text-left px-4 py-3.5 font-bold text-xs text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Category</th>
                  <th className="text-left px-4 py-3.5 font-bold text-xs text-muted-foreground uppercase tracking-wide hidden md:table-cell">Stats</th>
                  <th className="text-left px-4 py-3.5 font-bold text-xs text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="text-right px-5 py-3.5 font-bold text-xs text-muted-foreground uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {posts.map((post: any) => (
                  <tr key={post.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                          {post.cover_image ? (
                            <Image src={post.cover_image} alt={post.title} fill className="object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <p className="font-bold text-foreground truncate max-w-[200px]">{post.title}</p>
                            {post.is_featured && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground">{post.read_time} min read · {post.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <span className="px-2.5 py-1 rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                        {post.blog_categories?.name ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views ?? 0}</span>
                        <span>❤️ {post.blog_likes?.[0]?.count ?? 0}</span>
                        <span>💬 {post.blog_comments?.[0]?.count ?? 0}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {post.status === 'published' ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold">Published</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-bold">Draft</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/blog/${post.id}/edit`}
                          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <AdminBlogActions postId={post.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
