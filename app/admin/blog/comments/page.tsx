import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { MessageSquare, Trash2, CheckCircle2, Clock, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { AdminCommentActions } from '@/components/admin/blog-comment-actions'

export const metadata: Metadata = { title: 'Blog Comments' }

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default async function AdminBlogCommentsPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: adminRole } = await supabase.from('admin_roles').select('role').eq('user_id', user.id).single()
  if (!adminRole) redirect('/')

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: comments } = await admin
    .from('blog_comments')
    .select(`*, profiles(full_name, avatar_url), blog_posts(title, slug)`)
    .order('created_at', { ascending: false })
    .limit(200)

  const total = comments?.length ?? 0
  const approved = comments?.filter(c => c.is_approved).length ?? 0
  const pending = comments?.filter(c => !c.is_approved).length ?? 0

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">Blog Comments</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage and moderate reader comments</p>
        </div>
        <Link href="/admin/blog" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
          <BookOpen className="w-4 h-4" /> Back to Posts
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Comments', value: total,    icon: MessageSquare, color: 'text-violet-600 bg-violet-100 dark:bg-violet-950/40' },
          { label: 'Approved',       value: approved,  icon: CheckCircle2,  color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/40' },
          { label: 'Pending',        value: pending,   icon: Clock,         color: 'text-amber-600 bg-amber-100 dark:bg-amber-950/40' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Comments list */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {!comments?.length ? (
          <div className="text-center py-20">
            <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-bold text-foreground mb-2">No comments yet</p>
            <p className="text-sm text-muted-foreground">Comments will appear here once readers start engaging.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {comments.map((comment: any) => {
              const authorName = comment.profiles?.full_name ?? comment.guest_name ?? 'Anonymous'
              const initials = authorName[0]?.toUpperCase() ?? '?'
              return (
                <div key={comment.id} className="p-5 hover:bg-muted/20 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-violet-500/30 flex items-center justify-center flex-shrink-0 text-sm font-black text-primary">
                      {initials}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-sm text-foreground">{authorName}</span>
                        {comment.guest_email && (
                          <span className="text-xs text-muted-foreground">{comment.guest_email}</span>
                        )}
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
                        {comment.parent_id && (
                          <span className="px-1.5 py-0.5 rounded-md bg-muted text-xs font-semibold text-muted-foreground">Reply</span>
                        )}
                        {comment.is_approved ? (
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold">Approved</span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-bold">Pending</span>
                        )}
                      </div>

                      {/* Post reference */}
                      {comment.blog_posts && (
                        <Link
                          href={`/blog/${comment.blog_posts.slug}`}
                          target="_blank"
                          className="text-xs text-primary hover:underline font-semibold mb-2 block"
                        >
                          📄 {comment.blog_posts.title}
                        </Link>
                      )}

                      <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                    </div>

                    {/* Actions */}
                    <AdminCommentActions commentId={comment.id} isApproved={comment.is_approved} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
