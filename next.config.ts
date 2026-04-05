import type { NextConfig } from 'next'

const securityHeaders = [
  // Prevents clickjacking
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Prevents MIME sniffing — improves security score
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Strict referrer for privacy
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Permissions policy — privacy-respecting signal to Google
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
  },
  // DNS prefetch for faster third-party loads
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  // Force HTTPS — signals trust to Google
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // Cross-Origin policies for security
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
]

const apiHeaders = [
  // Tell crawlers not to index API routes
  { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
  { key: 'Cache-Control', value: 'no-store, max-age=0' },
]


const nextConfig: NextConfig = {
  // Suppress TS and ESLint errors during builds (carried over from original config)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Required for Supabase SSR package
  serverExternalPackages: ['@supabase/ssr'],

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
      // Placeholder / stock images used in dev
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'placeholder.com' },
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
        // API routes — noindex, no-store
        source: '/api/(.*)',
        headers: apiHeaders,
      },
      {
        // Admin routes — noindex
        source: '/admin(.*)',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
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

  // Canonical redirects — add production domain redirects here when deployed
  async redirects() {
    return []
  },
}

export default nextConfig
