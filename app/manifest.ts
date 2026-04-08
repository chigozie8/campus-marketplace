import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'VendoorX — Campus Marketplace',
    short_name: 'VendoorX',
    description: "Nigeria's #1 campus marketplace. Buy and sell electronics, fashion, books, food, and services directly on WhatsApp with zero platform fees.",
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#16a34a',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Browse Marketplace',
        short_name: 'Browse',
        description: 'Discover products from campus vendors',
        url: '/marketplace',
        icons: [{ src: '/icon-192', sizes: '192x192' }],
      },
      {
        name: 'My Dashboard',
        short_name: 'Dashboard',
        description: 'Manage your products and orders',
        url: '/dashboard',
        icons: [{ src: '/icon-192', sizes: '192x192' }],
      },
      {
        name: 'Post a Listing',
        short_name: 'Sell',
        description: 'List a new product for sale',
        url: '/seller/new',
        icons: [{ src: '/icon-192', sizes: '192x192' }],
      },
    ],
  categories: ['shopping', 'marketplace', 'education'],
  lang: 'en-NG',
  dir: 'ltr',
  prefer_related_applications: false,
  display_override: ['standalone', 'minimal-ui'],
  screenshots: [
    {
      src: '/vendoorx-explainer.jpg',
      sizes: '1280x720',
      type: 'image/jpeg',
      form_factor: 'wide',
      label: 'VendoorX campus marketplace',
    },
  ],
  }
}
