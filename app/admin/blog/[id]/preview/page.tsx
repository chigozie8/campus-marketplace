import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  ArrowLeft, Calendar, Clock, Eye, Tag, BookOpen,
  ChevronRight, AlertTriangle, Pencil,
} from 'lucide-react'

export const metadata: Metadata = { title: 'Preview Post | Admin' }

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function PreviewBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: adminRole } = await supabase.from('admin_roles').select('role').eq('user_id', user.id).single()
  if (!adminRole) redirect('/')

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*, blog_categories(name, slug), profiles(full_name, avatar_url)')
    .eq('id', id)
    .single()

  if (!post) notFound()

  const cat = post.blog_categories as { name: string; slug: string } | null
  const author = post.profiles as { full_name: string | null; avatar_url: string | null } | null

  return (
    <div className="min-h-screen bg-background">

      {/* ── Draft Preview Banner ── */}
      {post.status !== 'published' && (
        <div className="sticky top-0 z-50 bg-amber-500 text-white px-4 py-2.5 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5 text-sm font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Draft Preview — this post is not live yet</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/blog/${id}/edit`}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Link>
            <Link
              href="/admin/blog"
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Link>
          </div>
        </div>
      )}

      {/* ── Cover Image ── */}
      {post.cover_image && (
        <div className="relative h-64 sm:h-96 lg:h-[480px] w-full overflow-hidden bg-zinc-900">
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          <Link href="/admin/blog" className="hover:text-primary transition-colors">Blog Admin</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium line-clamp-1">{post.title}</span>
        </nav>

        {/* Status badge */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            post.status === 'published'
              ? 'bg-primary/10 text-primary'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
          }`}>
            {post.status}
          </span>
          {cat && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground">
              {cat.name}
            </span>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {post.published_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />{fmtDate(post.published_at)}
              </span>
            )}
            {post.read_time && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />{post.read_time} min read
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />{post.views ?? 0} views
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground leading-tight mb-5">
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-lg text-muted-foreground leading-relaxed border-l-4 border-primary pl-4 mb-8 italic">
            {post.excerpt}
          </p>
        )}

        {/* Author strip */}
        <div className="flex items-center gap-3 pb-8 border-b border-border mb-8">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
            {author?.avatar_url ? (
              <Image src={author.avatar_url} alt={author.full_name ?? ''} width={40} height={40} className="object-cover rounded-full" unoptimized />
            ) : (
              <span className="text-sm font-black text-primary">
                {(author?.full_name ?? 'VX')[0].toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{author?.full_name ?? 'VendoorX Team'}</p>
            <p className="text-xs text-muted-foreground">Published on VendoorX Blog</p>
          </div>
          <div className="ml-auto">
            <Link href="/admin/blog" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> All posts
            </Link>
          </div>
        </div>

        {/* Content */}
        {post.content ? (
          <div
            className="prose prose-gray dark:prose-invert prose-lg max-w-none
              prose-headings:font-black prose-headings:tracking-tight
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-2xl prose-img:shadow-lg
              prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-xl prose-blockquote:not-italic
              prose-code:bg-muted prose-code:text-foreground prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : (
          <div className="flex items-center gap-3 p-6 rounded-2xl bg-muted border border-border">
            <BookOpen className="w-5 h-5 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">No content written yet.</p>
          </div>
        )}

        {/* Tags */}
        {post.tags && (post.tags as string[]).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-border">
            <Tag className="w-4 h-4 text-muted-foreground mt-0.5" />
            {(post.tags as string[]).map((tag: string) => (
              <span key={tag} className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Admin actions footer */}
        <div className="mt-12 flex items-center gap-3 p-5 rounded-2xl bg-muted/50 border border-border">
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">Admin Actions</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {post.status === 'published' ? 'This post is live and visible to readers.' : 'This post is a draft and not visible to readers.'}
            </p>
          </div>
          <Link
            href={`/admin/blog/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit Post
          </Link>
          <Link
            href="/admin/blog"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted border border-border text-sm font-bold hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Posts
          </Link>
        </div>

      </div>
    </div>
  )
}
