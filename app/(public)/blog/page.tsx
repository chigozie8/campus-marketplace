import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import {
  BookOpen, Clock, Eye, Heart, ArrowRight, TrendingUp,
  Flame, Calendar, Tag, Search, ChevronLeft, ChevronRight, MessageSquare, Rss,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog | VendoorX — Campus Commerce Insights & Seller Tips',
  description: 'Read seller guides, campus business tips, success stories, and platform updates from VendoorX — Nigeria\'s #1 campus marketplace.',
  openGraph: {
    title: 'VendoorX Blog — Campus Commerce Insights',
    description: 'Seller tips, campus business guides, success stories, and market trends for Nigerian university students.',
    type: 'website',
  },
}

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

const PAGE_SIZE = 9

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string; q?: string }>
}) {
  const { category: catFilter, page: pageParam, q: searchQuery } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10))

  const supabase = await createClient()

  const SELECT_COLS = `id, title, slug, excerpt, cover_image, read_time, published_at, views, tags,
    blog_categories(name, slug),
    blog_likes(count), blog_comments(count)`

  const [{ data: categories }, { data: featured }, { data: trending }] = await Promise.all([
    supabase?.from('blog_categories').select('id, name, slug, color').order('name') ?? { data: [] },
    catFilter || searchQuery ? { data: null } : supabase?.from('blog_posts')
      .select(SELECT_COLS)
      .eq('status', 'published')
      .eq('is_featured', true)
      .order('published_at', { ascending: false })
      .limit(1)
      .single() ?? { data: null },
    supabase?.from('blog_posts')
      .select('id, title, slug, cover_image, views, read_time, published_at, blog_categories(name, slug)')
      .eq('status', 'published')
      .order('views', { ascending: false })
      .limit(5) ?? { data: [] },
  ])

  let query = supabase
    ?.from('blog_posts')
    .select(SELECT_COLS, { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  if (catFilter) query = query?.eq('blog_categories.slug', catFilter)
  if (searchQuery) query = query?.ilike('title', `%${searchQuery}%`)

  const { data: posts = [], count = 0 } = await (query ?? Promise.resolve({ data: [], count: 0 }))
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  const allCats = [{ id: 'all', name: 'All Posts', slug: '' }, ...(categories ?? [])]

  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO BANNER ── */}
      <div className="relative bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #16a34a 0%, transparent 50%), radial-gradient(circle at 80% 20%, #0ea5e9 0%, transparent 40%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex items-center gap-2 mb-4">
            <Rss className="w-4 h-4 text-[#16a34a]" />
            <span className="text-[#4ade80] text-xs font-bold uppercase tracking-widest">VendoorX Blog</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight max-w-2xl">
            Insights to grow your <span className="text-[#4ade80]">campus hustle</span>
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg max-w-xl mb-8 leading-relaxed">
            Seller tips, campus business guides, success stories, and everything you need to win on VendoorX.
          </p>

          {/* Search */}
          <form method="GET" className="flex gap-3 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              <input
                type="search"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search articles…"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-[#16a34a] text-white placeholder:text-zinc-500 outline-none text-sm transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-sm transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── FEATURED POST ── */}
        {featured && !catFilter && !searchQuery && (
          <Link
            href={`/blog/${featured.slug}`}
            className="group relative flex flex-col lg:flex-row overflow-hidden rounded-3xl bg-zinc-950 mb-14 shadow-2xl hover:shadow-[#16a34a]/20 transition-all duration-300"
          >
            {/* Image */}
            <div className="relative w-full lg:w-[55%] aspect-[16/9] lg:aspect-auto lg:min-h-[380px] shrink-0 overflow-hidden">
              {featured.cover_image ? (
                <Image
                  src={featured.cover_image}
                  alt={featured.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#16a34a]/30 to-zinc-800 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-zinc-600" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-950/60 lg:block hidden" />
              <span className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16a34a] text-white text-xs font-bold">
                <Flame className="w-3 h-3" /> Featured
              </span>
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center p-8 lg:p-10 text-white flex-1">
              {featured.blog_categories && (
                <span className="text-xs font-bold uppercase tracking-widest text-[#4ade80] mb-3">
                  {(featured.blog_categories as { name: string }).name}
                </span>
              )}
              <h2 className="text-2xl sm:text-3xl font-black leading-tight mb-3 group-hover:text-[#4ade80] transition-colors">
                {featured.title}
              </h2>
              {featured.excerpt && (
                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-6 line-clamp-3">
                  {featured.excerpt}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-zinc-500 mb-6">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {featured.published_at ? fmtDate(featured.published_at) : 'Unpublished'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {featured.read_time} min read
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  {fmtNum(featured.views ?? 0)}
                </span>
              </div>
              <span className="inline-flex items-center gap-2 text-[#16a34a] font-bold text-sm group-hover:gap-3 transition-all">
                Read article <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        )}

        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── MAIN CONTENT ── */}
          <div className="flex-1 min-w-0">

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
              {allCats.map(cat => {
                const isActive = (!catFilter && !cat.slug) || catFilter === cat.slug
                return (
                  <Link
                    key={cat.id}
                    href={cat.slug ? `?category=${cat.slug}` : '/blog'}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#16a34a] text-white shadow-md shadow-[#16a34a]/30'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                    }`}
                  >
                    {cat.name}
                  </Link>
                )
              })}
            </div>

            {/* Search result label */}
            {searchQuery && (
              <div className="flex items-center gap-2 mb-6">
                <Search className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {(count ?? 0)} result{count !== 1 ? 's' : ''} for <strong>&ldquo;{searchQuery}&rdquo;</strong>
                  <Link href="/blog" className="ml-3 text-primary hover:underline text-xs">Clear</Link>
                </p>
              </div>
            )}

            {/* Posts Grid */}
            {posts && posts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {posts.map((post) => {
                  const cat = post.blog_categories as { name: string; slug: string } | null
                  const likeCount = (post.blog_likes as { count: number }[])?.[0]?.count ?? 0
                  const commentCount = (post.blog_comments as { count: number }[])?.[0]?.count ?? 0
                  return (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group flex flex-col rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-200 overflow-hidden"
                    >
                      {/* Cover */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                        {post.cover_image ? (
                          <Image
                            src={post.cover_image}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-muted flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-muted-foreground/30" />
                          </div>
                        )}
                        {cat && (
                          <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold ${CAT_STYLES[cat.slug] ?? 'bg-muted text-muted-foreground'}`}>
                            {cat.name}
                          </span>
                        )}
                      </div>

                      {/* Body */}
                      <div className="flex flex-col flex-1 p-4 sm:p-5">
                        <h2 className="text-sm sm:text-base font-black text-foreground group-hover:text-primary transition-colors leading-snug mb-2 line-clamp-2">
                          {post.title}
                        </h2>
                        {post.excerpt && (
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                            {post.excerpt}
                          </p>
                        )}

                        {/* Tags */}
                        {post.tags && (post.tags as string[]).length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {(post.tags as string[]).slice(0, 3).map(tag => (
                              <span key={tag} className="px-2 py-0.5 rounded text-[10px] bg-muted text-muted-foreground font-medium">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-auto flex items-center justify-between text-[11px] text-muted-foreground pt-3 border-t border-border">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {post.read_time}m
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" /> {fmtNum(post.views ?? 0)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" /> {likeCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" /> {commentCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-20 rounded-2xl border border-dashed border-border">
                <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-foreground font-bold mb-1">No articles found</p>
                <p className="text-muted-foreground text-sm">
                  {searchQuery ? 'Try a different search term.' : 'Check back soon — articles are coming!'}
                </p>
                {(catFilter || searchQuery) && (
                  <Link href="/blog" className="mt-4 inline-flex items-center gap-1 text-primary text-sm font-semibold hover:underline">
                    View all posts <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {page > 1 && (
                  <Link
                    href={`?${catFilter ? `category=${catFilter}&` : ''}page=${page - 1}`}
                    className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-border hover:border-primary/40 text-sm font-semibold transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </Link>
                )}
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <Link
                      key={p}
                      href={`?${catFilter ? `category=${catFilter}&` : ''}page=${p}`}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                        p === page
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'border border-border hover:border-primary/40 text-muted-foreground'
                      }`}
                    >
                      {p}
                    </Link>
                  ))}
                </div>
                {page < totalPages && (
                  <Link
                    href={`?${catFilter ? `category=${catFilter}&` : ''}page=${page + 1}`}
                    className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-border hover:border-primary/40 text-sm font-semibold transition-all"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* ── SIDEBAR ── */}
          <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-6">

            {/* Trending */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-black text-foreground uppercase tracking-wide">Trending</h3>
              </div>
              <div className="flex flex-col gap-3">
                {(trending ?? []).map((post, i) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group flex gap-3 items-start"
                  >
                    <span className="text-2xl font-black text-muted-foreground/30 leading-none w-6 shrink-0 pt-0.5">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                        {post.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {fmtNum(post.views ?? 0)} views
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-black text-foreground uppercase tracking-wide">Categories</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {(categories ?? []).map(cat => (
                  <Link
                    key={cat.id}
                    href={`?category=${cat.slug}`}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105 ${CAT_STYLES[cat.slug] ?? 'bg-muted text-muted-foreground'}`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-5 text-white">
              <h3 className="text-base font-black mb-1">Get updates first</h3>
              <p className="text-white/80 text-xs leading-relaxed mb-4">
                New posts, seller tips & campus deals — straight to your inbox. No spam.
              </p>
              <form action="/api/newsletter" method="POST" className="flex flex-col gap-2">
                <input
                  type="email"
                  name="email"
                  placeholder="your@university.edu.ng"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/20 border border-white/30 focus:border-white text-white placeholder:text-white/50 outline-none text-sm"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-white text-primary font-bold text-sm hover:bg-white/90 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>

            {/* Quick links */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-black text-foreground uppercase tracking-wide mb-4">Quick links</h3>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Start selling', href: '/seller/new' },
                  { label: 'Browse marketplace', href: '/marketplace' },
                  { label: 'Seller dashboard', href: '/dashboard' },
                  { label: 'Help center', href: '/help' },
                ].map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center justify-between text-sm text-muted-foreground hover:text-primary transition-colors group"
                  >
                    {label}
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
