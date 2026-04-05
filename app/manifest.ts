import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'VendoorX — Campus Marketplace',
    short_name: 'VendoorX',
    description: "Nigeria's #1 campus marketplace. Buy and sell electronics, fashion, books, food, and services directly on WhatsApp with zero platform fees.",
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#16a34a',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['shopping', 'marketplace', 'education'],
    lang: 'en',
    dir: 'ltr',
  }
}
