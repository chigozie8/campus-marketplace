import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SITE_URL } from '@/lib/seo'

export const revalidate = 3600

const CATEGORY_SLUGS = [
  'electronics',
  'textbooks',
  'clothing',
  'food',
  'services',
  'accommodation',
  'furniture',
  'sports',
  'beauty',
  'others',
]

const PUBLIC_PAGES = [
  { path: '/about',        priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/pricing',      priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/blog',         priority: 0.85, changeFrequency: 'daily' as const },
  { path: '/help',         priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/trust',        priority: 0.6, changeFrequency: 'monthly' as const },
  { path: '/terms',        priority: 0.4, changeFrequency: 'yearly' as const },
  { path: '/privacy',      priority: 0.4, changeFrequency: 'yearly' as const },
  { path: '/cookies',      priority: 0.3, changeFrequency: 'yearly' as const },
  { path: '/refund',       priority: 0.4, changeFrequency: 'yearly' as const },
  { path: '/careers',      priority: 0.6, changeFrequency: 'weekly' as const },
  { path: '/contact',      priority: 0.6, changeFrequency: 'monthly' as const },
  { path: '/press',        priority: 0.5, changeFrequency: 'monthly' as const },
  { path: '/community',    priority: 0.6, changeFrequency: 'weekly' as const },
  { path: '/partnerships', priority: 0.5, changeFrequency: 'monthly' as const },
  { path: '/status',       priority: 0.3, changeFrequency: 'hourly' as const },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/marketplace`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
  ]

  const publicPages: MetadataRoute.Sitemap = PUBLIC_PAGES.map(p => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }))

  const categoryPages: MetadataRoute.Sitemap = CATEGORY_SLUGS.map(slug => ({
    url: `${SITE_URL}/marketplace?category=${slug}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }))

  try {
    const supabase = await createClient()
    if (!supabase) return [...staticPages, ...publicPages, ...categoryPages]

    const [productsRes, blogsRes, storesRes] = await Promise.all([
      supabase
        .from('products')
        .select('id, updated_at')
        .eq('is_available', true)
        .order('updated_at', { ascending: false })
        .limit(5000),
      supabase
        .from('blog_posts')
        .select('slug, updated_at')
        .eq('published', true)
        .order('updated_at', { ascending: false })
        .limit(1000),
      supabase
        .from('profiles')
        .select('id, updated_at')
        .eq('is_seller', true)
        .not('store_slug', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(2000),
    ])

    const productPages: MetadataRoute.Sitemap = (productsRes.data || []).map(p => ({
      url: `${SITE_URL}/marketplace/${p.id}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }))

    const blogPages: MetadataRoute.Sitemap = (blogsRes.data || []).map(p => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    }))

    const storePages: MetadataRoute.Sitemap = (storesRes.data || []).map(p => ({
      url: `${SITE_URL}/store/${p.id.slice(-6)}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    return [
      ...staticPages,
      ...publicPages,
      ...categoryPages,
      ...productPages,
      ...blogPages,
      ...storePages,
    ]
  } catch {
    return [...staticPages, ...publicPages, ...categoryPages]
  }
}
