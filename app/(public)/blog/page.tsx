import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { unstable_cache } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/service'
import {
  BookOpen, Clock, Eye, ArrowRight, TrendingUp,
  Flame, Calendar, Tag, Search, Rss,
} from 'lucide-react'
import { BlogPostGrid } from '@/components/blog/blog-post-grid'
import { BlogPostGridSkeleton } from '@/components/ui/skeletons'

export const revalidate = 60

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

const FEATURED_SELECT = `id, title, slug, excerpt, cover_image, read_time, published_at, views, tags,
  blog_categories(name, slug),
  blog_likes(count), blog_comments(count)`

const getCategories = unstable_cache(
  async () => {
    const supabase = createServiceClient()
    if (!supabase) return []
    const { data } = await supabase.from('blog_categories').select('id, name, slug, color').order('name')
    return data ?? []
  },
  ['blog-categories'],
  { revalidate: 300, tags: ['blog-categories'] },
)

const getFeaturedPost = unstable_cache(
  async () => {
    const supabase = createServiceClient()
    if (!supabase) return null
    const { data } = await supabase
      .from('blog_posts')
      .select(FEATURED_SELECT)
      .eq('status', 'published')
      .eq('is_featured', true)
      .order('published_at', { ascending: false })
      .limit(1)
      .single()
    return data ?? null
  },
  ['blog-featured-post'],
  { revalidate: 60, tags: ['blog-posts'] },
)

const getTrending = unstable_cache(
  async () => {
    const supabase = createServiceClient()
    if (!supabase) return []
    const { data } = await supabase
      .from('blog_posts')
      .select('id, title, slug, cover_image, views, read_time, published_at, blog_categories(name, slug)')
      .eq('status', 'published')
      .order('views', { ascending: false })
      .limit(5)
    return data ?? []
  },
  ['blog-trending'],
  { revalidate: 60, tags: ['blog-posts'] },
)

async function FeaturedSection() {
  const featured = await getFeaturedPost()
  if (!featured) return null
  return (
    <Link
      href={`/blog/${featured.slug}`}
      className="group relative flex flex-col lg:flex-row overflow-hidden rounded-3xl bg-zinc-950 mb-14 shadow-2xl hover:shadow-[#16a34a]/20 transition-all duration-300"
    >
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
  )
}

async function CategoryTabs({ catFilter }: { catFilter?: string }) {
  const categories = await getCategories()
  const allCats = [{ id: 'all', name: 'All Posts', slug: '' }, ...(categories ?? [])]
  return (
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
  )
}

async function BlogSidebar() {
  const [categories, trending] = await Promise.all([getCategories(), getTrending()])
  return (
    <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-6">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-black text-foreground uppercase tracking-wide">Trending</h3>
        </div>
        <div className="flex flex-col gap-3">
          {trending.map((post, i) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group flex gap-3 items-start">
              <span className="text-2xl font-black text-muted-foreground/30 leading-none w-6 shrink-0 pt-0.5">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">{post.title}</p>
                <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {fmtNum(post.views ?? 0)} views
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-black text-foreground uppercase tracking-wide">Categories</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
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
          <button type="submit" className="w-full py-2.5 rounded-xl bg-white text-primary font-bold text-sm hover:bg-white/90 transition-colors">
            Subscribe
          </button>
        </form>
      </div>

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
  )
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string; q?: string }>
}) {
  const { category: catFilter, page: pageParam, q: searchQuery } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10))

  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO BANNER — static, renders immediately ── */}
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
            <button type="submit" className="px-5 py-3 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-sm transition-colors">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── FEATURED — streams in independently ── */}
        {!catFilter && !searchQuery && (
          <Suspense fallback={null}>
            <FeaturedSection />
          </Suspense>
        )}

        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── MAIN CONTENT ── */}
          <div className="flex-1 min-w-0">
            {/* Category tabs — streams in */}
            <Suspense fallback={<div className="flex gap-2 pb-2 mb-8"><div className="h-8 w-20 rounded-full bg-muted animate-pulse" /><div className="h-8 w-24 rounded-full bg-muted animate-pulse" /><div className="h-8 w-20 rounded-full bg-muted animate-pulse" /></div>}>
              <CategoryTabs catFilter={catFilter} />
            </Suspense>

            {/* Post grid — streams in */}
            <Suspense fallback={<BlogPostGridSkeleton />}>
              <BlogPostGrid catFilter={catFilter} searchQuery={searchQuery} page={page} />
            </Suspense>
          </div>

          {/* ── SIDEBAR — streams in ── */}
          <Suspense fallback={
            <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-6">
              <div className="rounded-2xl border border-border bg-card p-5 h-52 animate-pulse" />
              <div className="rounded-2xl border border-border bg-card p-5 h-36 animate-pulse" />
            </aside>
          }>
            <BlogSidebar />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
