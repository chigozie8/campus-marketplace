import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import {
  ArrowLeft, Calendar, Clock, Eye, Tag, BookOpen,
  Share2, ChevronRight, TrendingUp, AlertTriangle,
  ServerCrash,
} from 'lucide-react'
import { BlogPostClient } from '@/components/blog/blog-post-client'

export const revalidate = 300

const CAT_STYLES: Record<string, string> = {
  'seller-tips':      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  'platform-updates': 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  'campus-life':      'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400',
  'success-stories':  'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
  'guides':           'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-400',
  'market-trends':    'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400',
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
}
function fmtNum(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

export async function generateStaticParams() {
  const supabase = createPublicClient()
  if (!supabase) return []
  const { data } = await supabase.from('blog_posts').select('slug').eq('status', 'published')
  return (data ?? []).map(p => ({ slug: p.slug as string }))
}

const getPost = unstable_cache(
  async (slug: string) => {
    const supabase = createPublicClient()
    if (!supabase) return { data: null, error: null }
    return supabase
      .from('blog_posts')
      .select(`*, blog_categories(name, slug, color), blog_likes(count), blog_comments(count)`)
      .eq('slug', slug)
      .single()
  },
  ['blog-post'],
  { revalidate: 300, tags: ['blog-posts'] },
)

const getRelated = unstable_cache(
  async (slug: string) => {
    const supabase = createPublicClient()
    if (!supabase) return []
    const { data } = await supabase
      .from('blog_posts')
      .select('id, title, slug, cover_image, excerpt, read_time, published_at, views, blog_categories(name, slug)')
      .eq('status', 'published')
      .neq('slug', slug)
      .order('published_at', { ascending: false })
      .limit(3)
    return data ?? []
  },
  ['blog-related'],
  { revalidate: 300, tags: ['blog-posts'] },
)

const getAuthor = unstable_cache(
  async (authorId: string) => {
    const supabase = createPublicClient()
    if (!supabase) return null
    const { data } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', authorId)
      .single()
    return data ?? null
  },
  ['blog-author'],
  { revalidate: 300, tags: ['profiles'] },
)

const getComments = unstable_cache(
  async (postId: string) => {
    const supabase = createPublicClient()
    if (!supabase) return []
    const { data: rawComments } = await supabase
      .from('blog_comments')
      .select('*')
      .eq('post_id', postId)
      .eq('is_approved', true)
      .order('created_at', { ascending: true })
    const commenterIds = [...new Set(
      (rawComments ?? [])
        .map((c: { user_id: string | null }) => c.user_id)
        .filter((id): id is string => !!id),
    )]
    let profileMap: Record<string, { id: string; full_name: string | null; avatar_url: string | null }> = {}
    if (commenterIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('id, full_name, avatar_url').in('id', commenterIds)
      profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))
    }
    return (rawComments ?? []).map((c: { user_id: string | null; [key: string]: unknown }) => ({
      ...c,
      profiles: c.user_id ? (profileMap[c.user_id] ?? null) : null,
    }))
  },
  ['blog-comments'],
  { revalidate: 60, tags: ['blog-comments'] },
)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const { data } = await getPost(slug)

  if (!data) return { title: 'Article Not Found | VendoorX Blog' }

  const title = data.seo_title ?? data.title
  const description = data.seo_description ?? data.excerpt ?? 'Read this article on the VendoorX blog.'
  const cat = (data.blog_categories as { name: string } | null)?.name

  return {
    title: `${title} | VendoorX Blog`,
    description,
    keywords: [...(data.tags ?? []), 'VendoorX', 'campus marketplace', 'Nigeria', cat].filter(Boolean).join(', '),
    openGraph: {
      title: data.title,
      description: description,
      images: data.cover_image ? [{ url: data.cover_image, width: 1200, height: 630 }] : [],
      type: 'article',
      publishedTime: data.published_at ?? undefined,
      tags: data.tags ?? [],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description,
      images: data.cover_image ? [data.cover_image] : [],
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const { data: post, error: postError } = await getPost(slug)

  if (postError && postError.code !== 'PGRST116') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <ServerCrash className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h1 className="text-xl font-black text-foreground mb-2">Something went wrong</h1>
          <p className="text-muted-foreground text-sm mb-6">
            We couldn&apos;t load this article right now. Please try again in a moment.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  if (!post) notFound()

  // All data fetched from unstable_cache — no cookies() calls, ISR-compatible.
  const [related, authorProfile, commentsData] = await Promise.all([
    getRelated(slug),
    post.author_id ? getAuthor(post.author_id) : null,
    getComments(post.id),
  ])

  const cat = post.blog_categories as { name: string; slug: string } | null
  const author = authorProfile as { full_name: string | null; avatar_url: string | null } | null
  const likeCount = Number((post.blog_likes as { count: unknown }[])?.[0]?.count ?? 0)
  const commentCount = Number((post.blog_comments as { count: unknown }[])?.[0]?.count ?? 0)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.seo_description ?? post.excerpt ?? '',
    image: post.cover_image ?? '',
    datePublished: post.published_at ?? '',
    dateModified: post.updated_at ?? post.published_at ?? '',
    author: { '@type': 'Person', name: author?.full_name ?? 'VendoorX Team' },
    publisher: {
      '@type': 'Organization',
      name: 'VendoorX',
      logo: { '@type': 'ImageObject', url: 'https://vendoorx.com/logo.png' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://vendoorx.com/blog/${slug}` },
    keywords: (post.tags ?? []).join(', '),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-background">

        {/* ── DRAFT BANNER ── */}
        {post.status !== 'published' && (
          <div className="sticky top-0 z-50 bg-amber-500 text-white px-4 py-2.5 flex items-center gap-3 shadow-md">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="text-sm font-bold">Draft Preview — this post is not visible to the public yet.</span>
          </div>
        )}

        {/* ── COVER IMAGE ── */}
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-10">

            {/* ── ARTICLE ── */}
            <article className="flex-1 min-w-0 max-w-3xl">

              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <ChevronRight className="w-3 h-3" />
                <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
                {cat && (
                  <>
                    <ChevronRight className="w-3 h-3" />
                    <Link href={`/blog?category=${cat.slug}`} className="hover:text-primary transition-colors">
                      {cat.name}
                    </Link>
                  </>
                )}
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground font-medium line-clamp-1">{post.title}</span>
              </nav>

              {/* Category + meta */}
              <div className="flex flex-wrap items-center gap-3 mb-5">
                {cat && (
                  <Link
                    href={`/blog?category=${cat.slug}`}
                    className={`px-3 py-1 rounded-full text-xs font-bold ${CAT_STYLES[cat.slug] ?? 'bg-muted text-muted-foreground'}`}
                  >
                    {cat.name}
                  </Link>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {post.published_at && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />{fmtDate(post.published_at)}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />{post.read_time} min read
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />{fmtNum(post.views ?? 0)} views
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
                  <Link href="/blog" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> All articles
                  </Link>
                </div>
              </div>

              {/* Rendered content + interactions */}
              <BlogPostClient
                post={{ id: post.id, slug: post.slug, title: post.title, content: post.content, likeCount, commentCount }}
                comments={commentsData ?? []}
              />

              {/* Tags */}
              {post.tags && (post.tags as string[]).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-border">
                  <Tag className="w-4 h-4 text-muted-foreground mt-0.5" />
                  {(post.tags as string[]).map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80 transition-colors cursor-default">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Author bio card */}
              <div className="mt-12 rounded-2xl border border-border bg-card p-6 flex gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                  {author?.avatar_url ? (
                    <Image src={author.avatar_url} alt={author.full_name ?? ''} width={56} height={56} className="object-cover rounded-full" unoptimized />
                  ) : (
                    <span className="text-xl font-black text-primary">
                      {(author?.full_name ?? 'V')[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Written by</p>
                  <p className="text-base font-black text-foreground">{author?.full_name ?? 'VendoorX Team'}</p>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Helping Nigerian students buy and sell smarter on campus. Follow us on WhatsApp, Instagram & TikTok @VendoorX.
                  </p>
                </div>
              </div>
            </article>

            {/* ── SIDEBAR ── */}
            <aside className="w-full lg:w-64 shrink-0 space-y-6 lg:sticky lg:top-20 self-start">

              {/* Share */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Share2 className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-black text-foreground uppercase tracking-wide">Share</h3>
                </div>
                <div className="flex flex-col gap-2">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + ' — https://vendoorx.com/blog/' + slug)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-sm font-semibold transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.533 5.85L.057 23.928a.5.5 0 0 0 .606.65l6.277-1.642A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.878 9.878 0 0 1-5.029-1.373l-.36-.214-3.733.977.998-3.645-.235-.375A9.865 9.865 0 0 1 2.1 12C2.1 6.534 6.534 2.1 12 2.1c5.466 0 9.9 4.434 9.9 9.9 0 5.466-4.434 9.9-9.9 9.9z"/></svg>
                    WhatsApp
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent('https://vendoorx.com/blog/' + slug)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zM17.083 19.77h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
                    Twitter / X
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://vendoorx.com/blog/' + slug)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] text-sm font-semibold transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    Facebook
                  </a>
                </div>
              </div>

              {/* Related */}
              {related && related.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-black text-foreground uppercase tracking-wide">Related</h3>
                  </div>
                  <div className="flex flex-col gap-4">
                    {related.map(r => (
                      <Link key={r.id} href={`/blog/${r.slug}`} className="group flex gap-3">
                        <div className="relative w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-muted">
                          {r.cover_image ? (
                            <Image src={r.cover_image} alt={r.title} fill className="object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                            {r.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />{r.read_time}m read
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Back to blog */}
              <Link
                href="/blog"
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border hover:border-primary/40 text-sm text-muted-foreground hover:text-primary transition-all group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Back to all articles
              </Link>
            </aside>
          </div>
        </div>
      </div>
    </>
  )
}
