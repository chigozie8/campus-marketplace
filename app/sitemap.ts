import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vendoorx.com'
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/marketplace`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
  ]

  // Dynamic product pages
  try {
    const supabase = await createClient()
    const { data: products } = await supabase
      .from('products')
      .select('id, updated_at')
      .eq('is_available', true)
      .order('updated_at', { ascending: false })
      .limit(1000)

    const productPages: MetadataRoute.Sitemap = (products || []).map((product) => ({
      url: `${baseUrl}/marketplace/${product.id}`,
      lastModified: new Date(product.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    return [...staticPages, ...productPages]
  } catch {
    return staticPages
  }
}
