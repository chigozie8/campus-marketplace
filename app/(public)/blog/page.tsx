import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BookOpen, Clock, Eye, Heart, ArrowRight, TrendingUp, Flame, Calendar } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog & Updates | VendoorX',
  description: 'Read the latest VendoorX news, seller tips, campus commerce insights, and platform updates.',
}

const CATEGORY_COLORS: Record<string, string> = {
  'seller-tips':      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  'platform-updates': 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  'campus-life':      'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400',
  'success-stories':  'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400',
  'guides':           'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>
}) {
  const { category: catFilter, page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10))
  const PAGE_SIZE = 9

  const supabase = await createClient()

  const [{ data: categories }, { data: featured }] = await Promise.all([
    supabase?.from('blog_categories').select('id, name, slug, color').order('name') ?? { data: [] },
    supabase?.from('blog_posts')
      .select(`id, title, slug, excerpt, cover_image, read_time, published_at, views, tags,
        blog_categories(name, slug),
        blog_likes(count), blog_comments(count)`)
      .eq('status', 'published')
      .eq('is_featured', true)
      .order('published_at', { ascending: false })
      .limit(1)
      .single() ?? { data: null },
  ])

  let query = supabase
    ?.from('blog_posts')
    .select(`id, title, slug, excerpt, cover_image, read_time, published_at, views, tags,
      blog_categories(name, slug),
      blog_likes(count), blog_comments(count)`, { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  if (catFilter) query = query?.eq('blog_categories.slug', catFilter)

  const { data: posts = [], count = 0 } = await (query ?? Promise.resolve({ data: [], count: 0 }))

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <section className="relative py-24 px-4 overflow-hidden border-b border-border bg-gradient-to-br from-violet-50 via-background to-background dark:from-violet-950/20">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-violet-400/8 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-primary/6 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-900/40 text-violet-700 dark:text-violet-400 text-xs font-bold uppercase tracking-widest mb-6">
            <BookOpen className="w-3.5 h-3.5" />
            Blog & Updates
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-foreground mb-5 leading-none tracking-tight">
            The VendoorX<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-primary">Blog</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-xl mx-auto">
            Seller tips, success stories, platform updates, and everything you need to thrive on campus.
          </p>
        </div>
      </section>

      {/* Featured Post */}
      {featured && (
        <section className="py-12 px-4 bg-muted/20 border-b border-border">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-bold text-foreground uppercase tracking-widest">Featured Post</span>
            </div>
            <Link href={`/blog/${featured.slug}`} className="group block">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 rounded-3xl overflow-hidden border border-border bg-card hover:border-primary/30 hover:shadow-2xl transition-all duration-500">
                <div className="lg:col-span-3 relative h-64 lg:h-auto bg-gradient-to-br from-violet-500 to-primary overflow-hidden">
                  {featured.cover_image ? (
                    <Image
                      src={featured.cover_image}
                      alt={featured.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="w-20 h-20 text-white/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
                </div>
                <div className="lg:col-span-2 p-8 flex flex-col justify-center gap-4">
                  {featured.blog_categories && (
                    <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full w-fit ${CATEGORY_COLORS[(featured.blog_categories as any).slug] ?? 'bg-primary/10 text-primary'}`}>
                      {(featured.blog_categories as any).name}
                    </span>
                  )}
                  <h2 className="text-2xl font-black text-foreground leading-tight group-hover:text-primary transition-colors">
                    {featured.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed line-clamp-3">{featured.excerpt}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(featured.published_at!)}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{featured.read_time} min read</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{(featured.views ?? 0).toLocaleString()}</span>
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{(featured.blog_likes as any)?.[0]?.count ?? 0}</span>
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-primary group-hover:gap-3 transition-all">
                    Read article <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Categories Filter */}
      <section className="py-8 px-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Link
            href="/blog"
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-colors ${!catFilter ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            All Posts
          </Link>
          {(categories ?? []).map((cat: any) => (
            <Link
              key={cat.slug}
              href={`/blog?category=${cat.slug}`}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-colors ${catFilter === cat.slug ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          {!posts?.length ? (
            <div className="text-center py-20">
              <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-lg font-bold text-foreground mb-2">No posts yet in this category</p>
              <p className="text-muted-foreground mb-6">Check back soon — we publish new content weekly.</p>
              <Link href="/blog" className="text-primary font-bold hover:underline">View all posts</Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(posts ?? []).map((post: any) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                    <article className="h-full rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-violet-500/20 overflow-hidden">
                        {post.cover_image ? (
                          <Image
                            src={post.cover_image}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-white/40" />
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex flex-col gap-3 flex-1">
                        {post.blog_categories && (
                          <span className={`text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full w-fit ${CATEGORY_COLORS[(post.blog_categories as any).slug] ?? 'bg-primary/10 text-primary'}`}>
                            {(post.blog_categories as any).name}
                          </span>
                        )}
                        <h2 className="font-black text-base text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.read_time}m</span>
                            <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{(post.blog_likes as any)?.[0]?.count ?? 0}</span>
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views ?? 0}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  {page > 1 && (
                    <Link
                      href={`/blog?page=${page - 1}${catFilter ? `&category=${catFilter}` : ''}`}
                      className="px-4 py-2 rounded-xl border border-border text-sm font-bold hover:bg-muted transition-colors"
                    >
                      ← Previous
                    </Link>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <Link
                      key={p}
                      href={`/blog?page=${p}${catFilter ? `&category=${catFilter}` : ''}`}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-colors ${p === page ? 'bg-foreground text-background' : 'border border-border hover:bg-muted'}`}
                    >
                      {p}
                    </Link>
                  ))}
                  {page < totalPages && (
                    <Link
                      href={`/blog?page=${page + 1}${catFilter ? `&category=${catFilter}` : ''}`}
                      className="px-4 py-2 rounded-xl border border-border text-sm font-bold hover:bg-muted transition-colors"
                    >
                      Next →
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-violet-500/5 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <TrendingUp className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-3xl font-black text-foreground mb-3">Stay in the loop</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Get weekly seller tips, campus business insights, and VendoorX updates delivered straight to you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@university.edu.ng"
              className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 transition-opacity flex-shrink-0">
              Subscribe
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">No spam. Unsubscribe anytime. 🤝</p>
        </div>
      </section>

    </div>
  )
}
