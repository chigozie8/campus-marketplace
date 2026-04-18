import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/dashboard/',
          '/profile/',
          '/assistant',
          '/assistant/',
          '/seller/new',
          '/seller/edit/',
          '/auth/',
          '/_next/',
          '/static/',
          '/payment/',
          '/orders/',
          '/wallet/',
          '/notifications/',
          '/inbox/',
          '/favorites/',
          '/cart/',
        ],
      },
      { userAgent: 'GPTBot',       disallow: '/' },
      { userAgent: 'ChatGPT-User', disallow: '/' },
      { userAgent: 'CCBot',        disallow: '/' },
      { userAgent: 'anthropic-ai', disallow: '/' },
      { userAgent: 'Claude-Web',   disallow: '/' },
      { userAgent: 'Google-Extended', disallow: '/' },
      { userAgent: 'PerplexityBot',   disallow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
