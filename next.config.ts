import type { NextConfig } from 'next'

const securityHeaders = [
  // Prevents clickjacking
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Prevents MIME sniffing — helps with security score on Lighthouse/Google
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Strict referrer for privacy and ranking
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Permissions policy — tells Google the page is privacy-respecting
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
  },
  // DNS prefetch for faster third-party loads (Supabase, fonts)
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  // Force HTTPS — signals trust to Google
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
]

const nextConfig: NextConfig = {
  // Compress responses — faster TTFB, a Core Web Vital factor
  compress: true,

  // Power optimised images — critical for LCP (Largest Contentful Paint)
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    remotePatterns: [
      // Supabase storage
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Supabase CDN
      {
        protocol: 'https',
        hostname: '*.supabase.in',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // Security & performance HTTP headers
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        // Long-lived cache for static assets — reduces repeat-visit load time
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache sitemap for 1 hour
        source: '/sitemap.xml',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' },
        ],
      },
      {
        // Cache robots.txt for 24 hours
        source: '/robots.txt',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
    ]
  },

  // Canonical redirects — prevents duplicate content penalties
  async redirects() {
    return [
      // Redirect www to non-www
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.campus-marketplace-pi.vercel.app' }],
        destination: 'https://campus-marketplace-pi.vercel.app/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
