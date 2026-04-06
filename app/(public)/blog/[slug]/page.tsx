import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Calendar, Clock, Eye, Tag } from 'lucide-react'
import { BlogPostClient } from '@/components/blog/blog-post-client'

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
}

const CATEGORY_COLORS: Record<string, string> = {
  'seller-tips':      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  'platform-updates': 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  'campus-life':      'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400',
  'success-stories':  'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400',
  'guides':           'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400',
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase?.from('blog_posts').select('title, excerpt, cover_image, seo_title, seo_description').eq('slug', slug).single() ?? { data: null }
  if (!data) return { title: 'Post Not Found | VendoorX Blog' }
  return {
    title: `${data.seo_title ?? data.title} | VendoorX Blog`,
    description: data.seo_description ?? data.excerpt ?? 'Read this article on the VendoorX blog.',
    openGraph: {
      title: data.title,
      description: data.excerpt ?? '',
      images: data.cover_image ? [data.cover_image] : [],
      type: 'article',
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const [{ data: post }, { data: related }] = await Promise.all([
    supabase?.from('blog_posts')
      .select(`*, blog_categories(name, slug, color), profiles(full_name, avatar_url),
        blog_likes(count), blog_comments(count)`)
      .eq('slug', slug)
      .eq('status', 'published')
      .single() ?? { data: null },
    supabase?.from('blog_posts')
      .select('id, title, slug, cover_image, excerpt, read_time, blog_categories(name, slug)')
      .eq('status', 'published')
      .neq('slug', slug)
      .order('published_at', { ascending: false })
      .limit(3) ?? { data: [] },
  ])

  if (!post) notFound()

  const { data: { user } } = await (supabase?.auth.getUser() ?? Promise.resolve({ data: { user: null } }))

  const { data: userLike } = user
    ? await (supabase?.from('blog_likes').select('id').eq('post_id', post.id).eq('user_id', user.id).single() ?? { data: null })
    : { data: null }

  const { data: commentsData } = await (supabase?.from('blog_comments')
    .select('*, profiles(full_name, avatar_url)')
    .eq('post_id', post.id)
    .eq('is_approved', true)
    .order('created_at', { ascending: true }) ?? { data: [] })

  return (
    <div className="min-h-screen bg-background">

      {/* Cover Image */}
      {post.cover_image && (
        <div className="relative h-64 sm:h-80 lg:h-[480px] w-full bg-gray-900 overflow-hidden">
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            priority
            className="object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 pb-20">

        {/* Back */}
        <div className="py-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </div>

        {/* Header */}
        <header className="mb-10">
          {post.blog_categories && (
            <span className={`inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 ${CATEGORY_COLORS[(post.blog_categories as any).slug] ?? 'bg-primary/10 text-primary'}`}>
              {(post.blog_categories as any).name}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground leading-tight mb-5">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-xl text-muted-foreground leading-relaxed mb-6">{post.excerpt}</p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 py-5 border-y border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center">
                {(post.profiles as any)?.avatar_url ? (
                  <Image src={(post.profiles as any).avatar_url} alt="" width={40} height={40} className="rounded-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-sm">
                    {(post.profiles as any)?.full_name?.[0] ?? 'V'}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  {(post.profiles as any)?.full_name ?? 'VendoorX Team'}
                </p>
                <p className="text-xs text-muted-foreground">Author</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap ml-auto">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(post.published_at)}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.read_time} min read</span>
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{(post.views ?? 0).toLocaleString()} views</span>
            </div>
          </div>
        </header>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag: string) => (
              <span key={tag} className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                <Tag className="w-3 h-3" />{tag}
              </span>
            ))}
          </div>
        )}

        {/* Content rendered client-side for markdown + interactivity */}
        <BlogPostClient
          post={{
            id: post.id,
            slug: post.slug,
            title: post.title,
            content: post.content,
            likeCount: (post.blog_likes as any)?.[0]?.count ?? 0,
            commentCount: (post.blog_comments as any)?.[0]?.count ?? 0,
          }}
          initialLiked={!!userLike}
          user={user ? { id: user.id, email: user.email ?? '' } : null}
          comments={commentsData ?? []}
        />

        {/* Related Posts */}
        {related && related.length > 0 && (
          <div className="mt-20 pt-12 border-t border-border">
            <h2 className="text-2xl font-black text-foreground mb-8">More from VendoorX</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map((r: any) => (
                <Link key={r.id} href={`/blog/${r.slug}`} className="group block">
                  <div className="rounded-2xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                    <div className="relative h-32 bg-gradient-to-br from-primary/20 to-violet-500/20">
                      {r.cover_image && (
                        <Image src={r.cover_image} alt={r.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-black text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">{r.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{r.read_time} min</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
