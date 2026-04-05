import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Allow all public content
        userAgent: '*',
        allow: [
          '/',
          '/marketplace',
          '/marketplace/',
          '/assistant',
          '/auth/login',
          '/auth/sign-up',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/dashboard/',
          '/profile/',
          '/seller/new',
          '/auth/reset-password',
          '/auth/forgot-password',
          '/auth/callback',
          '/_next/',
          '/static/',
        ],
      },
      // Block AI training crawlers that don't help SEO
      { userAgent: 'GPTBot', disallow: '/' },
      { userAgent: 'ChatGPT-User', disallow: '/' },
      { userAgent: 'CCBot', disallow: '/' },
      { userAgent: 'anthropic-ai', disallow: '/' },
      { userAgent: 'Claude-Web', disallow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
