'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Heart, MessageSquare, Share2, Send, Reply, Twitter, Link2, Check, ChevronDown } from 'lucide-react'

type Comment = {
  id: string
  content: string
  guest_name: string | null
  parent_id: string | null
  created_at: string
  profiles?: { full_name: string | null; avatar_url: string | null } | null
}

type Post = {
  id: string
  slug: string
  title: string
  content: string
  likeCount: number
  commentCount: number
}

export function BlogPostClient({
  post,
  initialLiked,
  user,
  comments: initialComments,
}: {
  post: Post
  initialLiked: boolean
  user: { id: string; email: string } | null
  comments: Comment[]
}) {
  const [liked, setLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [liking, setLiking] = useState(false)
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [sharePopup, setSharePopup] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [form, setForm] = useState({ content: '', guest_name: '', guest_email: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const commentRef = useRef<HTMLTextAreaElement>(null)

  // Track view
  useEffect(() => {
    fetch('/api/blog/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: post.slug }),
    }).catch(() => {})
  }, [post.slug])

  async function toggleLike() {
    if (liking) return
    setLiking(true)
    try {
      const res = await fetch('/api/blog/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: post.id }),
      })
      const data = await res.json()
      setLiked(data.liked)
      setLikeCount(data.count)
    } catch {}
    setLiking(false)
  }

  async function submitComment(parentId?: string) {
    if (!form.content.trim()) return
    if (!user && !form.guest_name.trim()) { setError('Please enter your name'); return }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/blog/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: post.id,
          content: form.content,
          parent_id: parentId ?? null,
          guest_name: form.guest_name || null,
          guest_email: form.guest_email || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to submit'); setSubmitting(false); return }
      setComments(prev => [...prev, data.comment])
      setForm({ content: '', guest_name: '', guest_email: '' })
      setReplyTo(null)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch { setError('Network error. Please try again.') }
    setSubmitting(false)
  }

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const topComments = comments.filter(c => !c.parent_id)
  const replies = (parentId: string) => comments.filter(c => c.parent_id === parentId)

  const CommentCard = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => {
    const authorName = comment.profiles?.full_name ?? comment.guest_name ?? 'Anonymous'
    const initials = authorName[0]?.toUpperCase() ?? '?'
    return (
      <div className={`${depth > 0 ? 'ml-8 pl-4 border-l-2 border-primary/20' : ''}`}>
        <div className="flex gap-3 py-4">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-violet-500/30 flex items-center justify-center flex-shrink-0 text-sm font-black text-primary">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-foreground">{authorName}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(comment.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
            {depth === 0 && (
              <button
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                className="flex items-center gap-1 mt-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
              >
                <Reply className="w-3.5 h-3.5" />
                {replyTo === comment.id ? 'Cancel reply' : 'Reply'}
              </button>
            )}
          </div>
        </div>

        {replyTo === comment.id && (
          <div className="ml-12 mb-4">
            <CommentForm parentId={comment.id} />
          </div>
        )}

        {replies(comment.id).map(r => (
          <CommentCard key={r.id} comment={r} depth={1} />
        ))}
      </div>
    )
  }

  const CommentForm = ({ parentId }: { parentId?: string }) => (
    <div className="space-y-3">
      {!user && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Your name *"
            value={form.guest_name}
            onChange={e => setForm(p => ({ ...p, guest_name: e.target.value }))}
            className="px-4 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            type="email"
            placeholder="Email (optional)"
            value={form.guest_email}
            onChange={e => setForm(p => ({ ...p, guest_email: e.target.value }))}
            className="px-4 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      )}
      <div className="relative">
        <textarea
          ref={parentId ? undefined : commentRef}
          rows={4}
          placeholder={parentId ? 'Write a reply...' : 'Share your thoughts...'}
          value={form.content}
          onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <span className="absolute bottom-3 right-3 text-xs text-muted-foreground">{form.content.length}/2000</span>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {success && !parentId && <p className="text-xs text-emerald-600 font-semibold">Comment posted! 🎉</p>}
      <button
        disabled={submitting || !form.content.trim()}
        onClick={() => submitComment(parentId)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        <Send className="w-4 h-4" />
        {submitting ? 'Posting...' : parentId ? 'Post Reply' : 'Post Comment'}
      </button>
    </div>
  )

  return (
    <>
      {/* Markdown Content */}
      <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed prose-p:text-foreground/90 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:bg-muted prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-pre:bg-gray-950 prose-pre:border prose-pre:border-border prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-strong:text-foreground prose-li:marker:text-primary mb-12">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </article>

      {/* Like + Share Bar */}
      <div className="sticky bottom-6 z-10 flex items-center justify-center mb-16">
        <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white dark:bg-card border border-border shadow-xl shadow-black/10 dark:shadow-black/30">
          <button
            onClick={toggleLike}
            disabled={liking}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              liked
                ? 'bg-red-50 dark:bg-red-950/30 text-red-500 border border-red-200 dark:border-red-900/40'
                : 'bg-muted text-muted-foreground hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''} ${liking ? 'animate-pulse' : ''}`} />
            <span>{likeCount}</span>
          </button>

          <button
            onClick={() => commentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{comments.length}</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setSharePopup(!sharePopup)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            {sharePopup && (
              <div className="absolute bottom-full mb-2 right-0 bg-white dark:bg-card border border-border rounded-2xl shadow-xl p-3 min-w-[180px] space-y-1">
                <button onClick={copyLink} className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm hover:bg-muted transition-colors text-foreground font-semibold">
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Link2 className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy link'}
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                  target="_blank"
                  rel="noopener"
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm hover:bg-muted transition-colors text-foreground font-semibold"
                >
                  <Twitter className="w-4 h-4" />
                  Share on X
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(post.title + '\n' + (typeof window !== 'undefined' ? window.location.href : ''))}`}
                  target="_blank"
                  rel="noopener"
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm hover:bg-muted transition-colors text-foreground font-semibold"
                >
                  💬 Share on WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-8 pt-10 border-t border-border" id="comments">
        <h2 className="text-2xl font-black text-foreground mb-8 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary" />
          {comments.length} Comment{comments.length !== 1 ? 's' : ''}
        </h2>

        {/* New Comment Form */}
        <div className="rounded-2xl border border-border bg-muted/20 p-6 mb-10">
          <h3 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wide">Leave a comment</h3>
          <CommentForm />
        </div>

        {/* Comment List */}
        {topComments.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-dashed border-border">
            <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground font-semibold">No comments yet — be the first!</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {topComments.map(c => (
              <CommentCard key={c.id} comment={c} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
