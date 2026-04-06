import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, CheckCircle2, XCircle, ExternalLink } from 'lucide-react'
import { BlogCommentActions } from '@/components/admin/blog-comment-actions'

export default async function AdminBlogCommentsPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: adminRole } = await supabase.from('admin_roles').select('role').eq('user_id', user.id).single()
  if (!adminRole) redirect('/')

  const { data: comments } = await supabase
    .from('blog_comments')
    .select(`*, blog_posts(title, slug), profiles(full_name)`)
    .order('created_at', { ascending: false })

  const pending  = comments?.filter(c => !c.is_approved).length ?? 0
  const approved = comments?.filter(c => c.is_approved).length ?? 0

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">Blog Comments</h1>
          <p className="text-muted-foreground text-sm mt-1">{comments?.length ?? 0} total comments</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-xs font-bold">
            {pending} pending
          </div>
          <div className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
            {approved} approved
          </div>
        </div>
      </div>

      {!comments?.length ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-border">
          <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-bold text-foreground">No comments yet</p>
          <p className="text-muted-foreground text-sm mt-1">Comments from blog readers will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map(comment => {
            const post = comment.blog_posts as { title: string; slug: string } | null
            const profile = comment.profiles as { full_name: string | null } | null
            const name = profile?.full_name ?? comment.guest_name ?? 'Anonymous'
            const date = new Date(comment.created_at).toLocaleDateString('en-NG', {
              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })

            return (
              <div
                key={comment.id}
                className={`rounded-2xl border p-5 transition-all ${
                  comment.is_approved
                    ? 'border-border bg-card'
                    : 'border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/10'
                }`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-foreground">{name}</span>
                      {!comment.user_id && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground font-medium">Guest</span>
                      )}
                      {comment.parent_id && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-medium">Reply</span>
                      )}
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        comment.is_approved
                          ? 'bg-primary/10 text-primary'
                          : 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
                      }`}>
                        {comment.is_approved
                          ? <><CheckCircle2 className="w-3 h-3" /> Approved</>
                          : <><XCircle className="w-3 h-3" /> Pending</>}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap mb-2">
                      {comment.content}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{date}</span>
                      {post && (
                        <Link
                          href={`/blog/${post.slug}#comments`}
                          target="_blank"
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {post.title}
                        </Link>
                      )}
                    </div>
                  </div>
                  <BlogCommentActions commentId={comment.id} isApproved={comment.is_approved} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
