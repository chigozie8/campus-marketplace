import Link from 'next/link'
import Image from 'next/image'
import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import {
  BookOpen, Clock, Eye, Heart, ArrowRight,
  Search, ChevronLeft, ChevronRight, MessageSquare,
} from 'lucide-react'

const CAT_STYLES: Record<string, string> = {
  'seller-tips':      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  'platform-updates': 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  'campus-life':      'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400',
  'success-stories':  'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
  'guides':           'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-400',
  'market-trends':    'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400',
}

function fmtNum(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

const PAGE_SIZE = 9

const SELECT_COLS = `id, title, slug, excerpt, cover_image, read_time, published_at, views, tags,
  blog_categories(name, slug),
  blog_likes(count), blog_comments(count)`

interface Props {
  catFilter?: string
  searchQuery?: string
  page: number
}

const getCachedPostGrid = unstable_cache(
  async (catFilter: string | undefined, searchQuery: string | undefined, page: number) => {
    const supabase = createPublicClient()
    if (!supabase) return { posts: [], count: 0, totalPages: 0 }

    let catId: string | null = null
    if (catFilter) {
      const { data: catRow } = await supabase
        .from('blog_categories')
        .select('id')
        .eq('slug', catFilter)
        .single()
      catId = catRow?.id ?? null
    }

    let q = supabase
      .from('blog_posts')
      .select(SELECT_COLS, { count: 'exact' })
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
    if (catId) q = q.eq('category_id', catId)
    if (searchQuery) q = q.ilike('title', `%${searchQuery}%`)

    const { data, count } = await q
    return { posts: data ?? [], count: count ?? 0, totalPages: Math.ceil((count ?? 0) / PAGE_SIZE) }
  },
  ['blog-post-grid'],
  { revalidate: 60, tags: ['blog-posts'] },
)

export async function BlogPostGrid({ catFilter, searchQuery, page }: Props) {
  const { posts, count, totalPages } = await getCachedPostGrid(catFilter, searchQuery, page)

  return (
    <>
      {searchQuery && (
        <div className="flex items-center gap-2 mb-6">
          <Search className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {(count ?? 0)} result{count !== 1 ? 's' : ''} for <strong>&ldquo;{searchQuery}&rdquo;</strong>
            <Link href="/blog" className="ml-3 text-primary hover:underline text-xs">Clear</Link>
          </p>
        </div>
      )}

      {posts && posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {posts.map((post) => {
            const cat = post.blog_categories as { name: string; slug: string } | null
            const likeCount = Number((post.blog_likes as { count: unknown }[])?.[0]?.count ?? 0)
            const commentCount = Number((post.blog_comments as { count: unknown }[])?.[0]?.count ?? 0)
            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
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

                <div className="flex flex-col flex-1 p-4 sm:p-5">
                  <h2 className="text-sm sm:text-base font-black text-foreground group-hover:text-primary transition-colors leading-snug mb-2 line-clamp-2">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                      {post.excerpt}
                    </p>
                  )}

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
    </>
  )
}
