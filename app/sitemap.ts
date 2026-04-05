import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SITE_URL } from '@/lib/seo'

export const revalidate = 3600

// Category slugs — each becomes a crawlable landing page
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categoryPages: MetadataRoute.Sitemap = CATEGORY_SLUGS.map(slug => ({
    url: `${SITE_URL}/marketplace?category=${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }))

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/marketplace`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/assistant`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/auth/sign-up`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // Dynamic product pages
  try {
    const supabase = await createClient()
    if (!supabase) return staticPages

    const { data: products } = await supabase
      .from('products')
      .select('id, updated_at')
      .eq('is_available', true)
      .order('updated_at', { ascending: false })
      .limit(5000)

    const productPages: MetadataRoute.Sitemap = (products || []).map((product) => ({
      url: `${SITE_URL}/marketplace/${product.id}`,
      lastModified: new Date(product.updated_at),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }))

    return [...staticPages, ...categoryPages, ...productPages]
  } catch {
    return [...staticPages, ...categoryPages]
  }
}
