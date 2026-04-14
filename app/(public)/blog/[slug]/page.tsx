import type { Metadata } from 'next'
import { cache } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import {
  ArrowLeft, Calendar, Clock, Eye, Tag, BookOpen,
  Share2, ChevronRight, TrendingUp, AlertTriangle,
  ServerCrash,
} from 'lucide-react'
import { BlogPostClient } from '@/components/blog/blog-post-client'
import { BlogShareButtons } from '@/components/blog/blog-share-buttons'

export const dynamic = 'force-dynamic'

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

const getPost = cache(async (slug: string) => {
  const supabase = createServiceClient()
  if (!supabase) return { data: null, error: null }
  return supabase
    .from('blog_posts')
    .select(`*, blog_categories(name, slug, color), blog_likes(count), blog_comments(count)`)
    .eq('slug', slug)
    .single()
})

const getRelated = cache(async (slug: string) => {
  const supabase = createServiceClient()
  if (!supabase) return []
  const { data } = await supabase
    .from('blog_posts')
    .select('id, title, slug, cover_image, excerpt, read_time, published_at, views, blog_categories(name, slug)')
    .eq('status', 'published')
    .neq('slug', slug)
    .order('published_at', { ascending: false })
    .limit(3)
  return data ?? []
})

const getAuthor = cache(async (authorId: string) => {
  const supabase = createServiceClient()
  if (!supabase) return null
  const { data } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', authorId)
    .single()
  return data ?? null
})

const getComments = cache(async (postId: string) => {
  const supabase = createServiceClient()
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
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vendoorx.ng'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const { data } = await getPost(slug)

  if (!data) return { title: 'Article Not Found | VendoorX Blog' }

  const post = data
  const title = post.seo_title ?? post.title
  const description = post.seo_description ?? post.excerpt ?? 'Read this article on the VendoorX Blog — tips, guides and insights for Nigerian sellers on WhatsApp.'
  const cat = post.blog_categories as { name: string; slug: string } | null
  const canonicalUrl = `${SITE_URL}/blog/${slug}`
  const coverImage = post.cover_image ?? `${SITE_URL}/opengraph-image`

  const rawTags: string[] = post.tags ?? []
  const keywords = [
    ...rawTags,
    'VendoorX',
    'Nigeria marketplace',
    'WhatsApp commerce',
    'sell on WhatsApp Nigeria',
    'WhatsApp business Nigeria',
    'online selling Nigeria',
    'VendoorX blog',
    cat?.name,
  ].filter(Boolean) as string[]

  const author = post.author_id
    ? await getAuthor(post.author_id).then(a => (a as { full_name: string | null } | null)?.full_name ?? 'VendoorX Team')
    : 'VendoorX Team'

  return {
    metadataBase: new URL(SITE_URL),
    title: `${title} | VendoorX Blog`,
    description,
    keywords: keywords.join(', '),

    authors: [{ name: author, url: SITE_URL }],

    alternates: {
      canonical: canonicalUrl,
    },

    robots: {
      index: post.status === 'published',
      follow: true,
      googleBot: {
        index: post.status === 'published',
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
      },
    },

    openGraph: {
      title: post.title,
      description,
      url: canonicalUrl,
      siteName: 'VendoorX',
      locale: 'en_NG',
      type: 'article',
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at ?? post.published_at ?? undefined,
      authors: [author],
      section: cat?.name ?? 'General',
      tags: rawTags,
      images: [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
          type: 'image/jpeg',
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      site: '@vendoorx',
      creator: '@vendoorx',
      title: post.title,
      description,
      images: [{ url: coverImage, alt: post.title }],
    },

    other: {
      'article:published_time': post.published_at ?? '',
      'article:modified_time': post.updated_at ?? post.published_at ?? '',
      'article:author': author,
      'article:section': cat?.name ?? 'General',
      ...Object.fromEntries(rawTags.map((tag, i) => [`article:tag:${i}`, tag])),
      'theme-color': '#16a34a',
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

  const [related, authorProfile, commentsData] = await Promise.all([
    getRelated(slug),
    post.author_id ? getAuthor(post.author_id) : null,
    getComments(post.id),
  ])

  const cat = post.blog_categories as { name: string; slug: string } | null
  const author = authorProfile as { full_name: string | null; avatar_url: string | null } | null
  const likeCount = Number((post.blog_likes as { count: unknown }[])?.[0]?.count ?? 0)
  const commentCount = Number((post.blog_comments as { count: unknown }[])?.[0]?.count ?? 0)

  const postUrl = `${SITE_URL}/blog/${slug}`
  const coverImage = post.cover_image ?? `${SITE_URL}/opengraph-image`
  const wordCount = post.content
    ? post.content.trim().split(/\s+/).length
    : undefined

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${postUrl}#article`,
        headline: post.title,
        name: post.title,
        description: post.seo_description ?? post.excerpt ?? '',
        image: {
          '@type': 'ImageObject',
          url: coverImage,
          width: 1200,
          height: 630,
        },
        url: postUrl,
        datePublished: post.published_at ?? '',
        dateModified: post.updated_at ?? post.published_at ?? '',
        inLanguage: 'en-NG',
        isAccessibleForFree: true,
        ...(wordCount ? { wordCount } : {}),
        articleSection: cat?.name ?? 'General',
        keywords: [
          ...(post.tags ?? []),
          'VendoorX',
          'Nigeria marketplace',
          'WhatsApp commerce',
          cat?.name,
        ].filter(Boolean).join(', '),
        author: {
          '@type': 'Person',
          name: author?.full_name ?? 'VendoorX Team',
          url: SITE_URL,
        },
        publisher: {
          '@type': 'Organization',
          '@id': `${SITE_URL}#organization`,
          name: 'VendoorX',
          url: SITE_URL,
          logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/logo.png`,
            width: 512,
            height: 512,
          },
          sameAs: [
            'https://twitter.com/vendoorx',
            'https://instagram.com/vendoorx',
            'https://facebook.com/vendoorx',
          ],
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': postUrl,
        },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
            ...(cat ? [{ '@type': 'ListItem', position: 3, name: cat.name, item: `${SITE_URL}/blog?category=${cat.slug}` }] : []),
            { '@type': 'ListItem', position: cat ? 4 : 3, name: post.title, item: postUrl },
          ],
        },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}#organization`,
        name: 'VendoorX',
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/logo.png`,
        },
        description: "Nigeria's AI-Powered WhatsApp Commerce Platform",
        areaServed: 'NG',
        sameAs: [
          'https://twitter.com/vendoorx',
          'https://instagram.com/vendoorx',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}#website`,
        url: SITE_URL,
        name: 'VendoorX',
        description: "Nigeria's #1 WhatsApp Vendor Marketplace",
        inLanguage: 'en-NG',
        publisher: { '@id': `${SITE_URL}#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
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
                <BlogShareButtons title={post.title} slug={slug} />
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
