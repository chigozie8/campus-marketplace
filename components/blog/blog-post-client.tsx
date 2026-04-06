'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Heart, MessageSquare, Send, Reply, Check, Link2, ChevronDown, ChevronUp, Copy } from 'lucide-react'

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

type Props = {
  mode: 'progress-only' | 'full'
  post: Post
  initialLiked: boolean
  user: { id: string; email: string } | null
  comments: Comment[]
}

function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function onScroll() {
      const el = document.documentElement
      const scrolled = el.scrollTop
      const total = el.scrollHeight - el.clientHeight
      setProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-[#16a34a] to-[#4ade80] transition-all duration-100 rounded-r-full shadow-sm shadow-[#16a34a]/50"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

function CommentItem({
  comment,
  depth = 0,
  onReply,
}: {
  comment: Comment
  depth?: number
  onReply: (id: string, name: string) => void
}) {
  const name = comment.profiles?.full_name ?? comment.guest_name ?? 'Anonymous'
  const initials = name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
  const date = new Date(comment.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className={`flex gap-3 ${depth > 0 ? 'ml-8 sm:ml-12 border-l-2 border-border pl-4' : ''}`}>
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-black text-primary">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold text-foreground">{name}</span>
          <span className="text-[11px] text-muted-foreground">{date}</span>
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">{comment.content}</p>
        {depth === 0 && (
          <button
            onClick={() => onReply(comment.id, name)}
            className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <Reply className="w-3 h-3" /> Reply
          </button>
        )}
      </div>
    </div>
  )
}

function CodeBlock({ children, className }: { children?: React.ReactNode; className?: string }) {
  const [copied, setCopied] = useState(false)
  const code = String(children).replace(/\n$/, '')

  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (!className) {
    return (
      <code className="px-1.5 py-0.5 rounded bg-muted text-primary text-[0.85em] font-mono">
        {children}
      </code>
    )
  }

  return (
    <div className="relative group my-4">
      <button
        onClick={copy}
        className="absolute top-3 right-3 z-10 p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white/60 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
        aria-label="Copy code"
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
      <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-100 font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export function BlogPostClient({ mode, post, initialLiked, user, comments: initComments }: Props) {
  const [liked, setLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [liking, setLiking] = useState(false)
  const [comments, setComments] = useState<Comment[]>(initComments)
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null)
  const [showComments, setShowComments] = useState(true)
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({ content: '', guest_name: '', guest_email: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [, startTransition] = useTransition()
  const commentRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetch('/api/blog/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: post.id }),
    }).catch(() => {})
  }, [post.id])

  if (mode === 'progress-only') return <ReadingProgress />

  async function toggleLike() {
    if (!user || liking) return
    setLiking(true)
    const prev = liked
    setLiked(!liked)
    setLikeCount(c => c + (liked ? -1 : 1))
    try {
      const res = await fetch('/api/blog/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id }),
      })
      if (!res.ok) { setLiked(prev); setLikeCount(c => c + (prev ? 1 : -1)) }
    } catch { setLiked(prev); setLikeCount(c => c + (prev ? 1 : -1)) }
    finally { setLiking(false) }
  }

  function handleReply(id: string, name: string) {
    setReplyTo({ id, name })
    setTimeout(() => commentRef.current?.focus(), 100)
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!form.content.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/blog/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          content: form.content,
          guestName: user ? null : form.guest_name,
          guestEmail: user ? null : form.guest_email,
          parentId: replyTo?.id ?? null,
        }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Failed to post comment'); return }

      if (user) {
        setComments(prev => [...prev, json.comment])
      }
      setForm({ content: '', guest_name: '', guest_email: '' })
      setReplyTo(null)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 4000)
    } catch { setError('Network error. Please try again.') }
    finally { setSubmitting(false) }
  }

  function copyLink() {
    navigator.clipboard.writeText(`https://vendoorx.com/blog/${post.slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const topComments = comments.filter(c => !c.parent_id)
  const replies = comments.filter(c => !!c.parent_id)

  return (
    <div>
      {/* ── ARTICLE CONTENT ── */}
      <div className="prose prose-zinc dark:prose-invert max-w-none
        prose-headings:font-black prose-headings:tracking-tight prose-headings:text-foreground
        prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
        prose-p:text-[1.05rem] prose-p:leading-[1.8] prose-p:text-foreground/90
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-xl prose-blockquote:py-1 prose-blockquote:not-italic
        prose-img:rounded-2xl prose-img:shadow-xl
        prose-strong:text-foreground
        prose-li:text-foreground/90 prose-li:leading-relaxed
        prose-hr:border-border prose-hr:my-10
        prose-table:rounded-xl prose-table:overflow-hidden
        prose-th:bg-muted prose-th:text-foreground
        prose-td:border-border
      ">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code: ({ className, children }) => (
              <CodeBlock className={className}>{children}</CodeBlock>
            ),
            img: ({ src, alt }) => (
              src ? (
                <span className="block my-8 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={alt ?? ''} className="w-full rounded-2xl shadow-xl" loading="lazy" />
                  {alt && <span className="block text-center text-xs text-muted-foreground mt-2 italic">{alt}</span>}
                </span>
              ) : null
            ),
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      {/* ── ENGAGEMENT BAR ── */}
      <div className="sticky bottom-6 z-40 flex justify-center mt-10 pointer-events-none">
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-background/95 backdrop-blur border border-border shadow-2xl pointer-events-auto">
          <button
            onClick={toggleLike}
            disabled={!user || liking}
            title={!user ? 'Sign in to like' : liked ? 'Unlike' : 'Like'}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${
              liked
                ? 'bg-red-50 dark:bg-red-950/30 text-red-500 border border-red-200 dark:border-red-900/40'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
            } ${!user ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <Heart className={`w-4 h-4 transition-all ${liked ? 'fill-red-500 scale-110' : ''}`} />
            {likeCount}
          </button>

          <button
            onClick={() => { setShowComments(s => !s); setTimeout(() => commentRef.current?.focus(), 200) }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground text-sm font-bold transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            {comments.length}
          </button>

          <button
            onClick={copyLink}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground text-sm font-bold transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-primary" /> : <Link2 className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      </div>

      {/* ── COMMENTS SECTION ── */}
      <div id="comments" className="mt-16 pt-8 border-t border-border">
        <button
          onClick={() => setShowComments(s => !s)}
          className="flex items-center gap-3 mb-8 group"
        >
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-black text-foreground group-hover:text-primary transition-colors">
            {comments.length} Comment{comments.length !== 1 ? 's' : ''}
          </h2>
          {showComments ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>

        {showComments && (
          <>
            {/* Comment form */}
            <form onSubmit={submitComment} className="mb-10 rounded-2xl border border-border bg-card p-5 sm:p-6">
              <h3 className="text-sm font-black text-foreground mb-4">
                {replyTo ? `↩ Replying to ${replyTo.name}` : 'Leave a comment'}
                {replyTo && (
                  <button type="button" onClick={() => setReplyTo(null)} className="ml-3 text-xs text-muted-foreground hover:text-primary transition-colors font-normal">
                    Cancel reply
                  </button>
                )}
              </h3>

              {!user && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Your name *"
                    value={form.guest_name}
                    onChange={e => setForm(f => ({ ...f, guest_name: e.target.value }))}
                    required={!user}
                    className="px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
                  />
                  <input
                    type="email"
                    placeholder="Email (optional, not shown)"
                    value={form.guest_email}
                    onChange={e => setForm(f => ({ ...f, guest_email: e.target.value }))}
                    className="px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
                  />
                </div>
              )}

              <textarea
                ref={commentRef}
                rows={4}
                placeholder={user ? 'Share your thoughts…' : 'Share your thoughts…'}
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm resize-none transition-all mb-3"
              />

              {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
              {success && (
                <p className="text-primary text-xs mb-3 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  {user ? 'Comment posted!' : 'Comment submitted for review — thank you!'}
                </p>
              )}

              <div className="flex items-center justify-between">
                {!user && (
                  <p className="text-xs text-muted-foreground">
                    Guest comments are reviewed before appearing.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={submitting || !form.content.trim()}
                  className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 active:scale-95 disabled:opacity-60 text-primary-foreground text-sm font-bold transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Posting…' : 'Post Comment'}
                </button>
              </div>
            </form>

            {/* Comment list */}
            {comments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Be the first to comment!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {topComments.map(comment => (
                  <div key={comment.id}>
                    <CommentItem comment={comment} onReply={handleReply} />
                    {replies.filter(r => r.parent_id === comment.id).map(reply => (
                      <div key={reply.id} className="mt-4">
                        <CommentItem comment={reply} depth={1} onReply={handleReply} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
