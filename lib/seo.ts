import type { Metadata } from 'next'

export const SITE_NAME = 'VendoorX'
export const SITE_TAGLINE = "Nigeria's #1 AI-Powered WhatsApp Vendor Marketplace"
export const SITE_DESCRIPTION =
  'VendoorX is Nigeria\'s leading WhatsApp vendor marketplace. Buy and sell with AI-powered automation — product discovery, orders, payments, and delivery tracking all handled through WhatsApp. Join thousands of vendors and buyers on VendoorX.'
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vendoorx.ng'
export const SITE_TWITTER = '@vendoorx'
export const OG_IMAGE = `${SITE_URL}/opengraph-image`

export const SITE_KEYWORDS = [
  // Brand keywords
  'VendoorX',
  'Vendoorx',
  'vendoorx',
  'Vendoor',
  'vendoor',
  'vendoor marketplace',
  'VendoorX Nigeria',
  'VendoorX app',
  'VendoorX store',
  'vendoorx.ng',

  // WhatsApp commerce
  'WhatsApp marketplace Nigeria',
  'WhatsApp vendor Nigeria',
  'WhatsApp commerce Nigeria',
  'sell on WhatsApp Nigeria',
  'WhatsApp store Nigeria',
  'WhatsApp shop Nigeria',
  'WhatsApp business Nigeria',
  'WhatsApp order Nigeria',
  'WhatsApp payment Nigeria',
  'WhatsApp seller Nigeria',
  'WhatsApp buyer Nigeria',
  'WhatsApp product listing Nigeria',
  'buy on WhatsApp Nigeria',

  // Vendor / seller keywords
  'vendor marketplace Nigeria',
  'online vendor Nigeria',
  'become a vendor Nigeria',
  'vendor app Nigeria',
  'sell online Nigeria',
  'online seller Nigeria',
  'Nigeria vendor platform',
  'Nigerian vendors',
  'campus vendor Nigeria',
  'student vendor Nigeria',

  // AI keywords
  'AI marketplace Nigeria',
  'AI powered commerce Nigeria',
  'AI vendor platform Nigeria',
  'AI shopping Nigeria',
  'AI WhatsApp bot Nigeria',
  'conversational commerce Nigeria',
  'AI sales automation Nigeria',
  'chatbot marketplace Nigeria',

  // Commerce / marketplace
  'online marketplace Nigeria',
  'Nigerian marketplace',
  'ecommerce Nigeria',
  'mobile commerce Nigeria',
  'buy and sell Nigeria',
  'campus marketplace Nigeria',
  'student marketplace Nigeria',
  'escrow payment Nigeria',
  'secure payment Nigeria',
  'Paystack marketplace',

  // Location-specific
  'Lagos marketplace',
  'Abuja marketplace',
  'Port Harcourt marketplace',
  'Nigerian university marketplace',
  'campus store Nigeria',
]

/**
 * Generates a consistent Metadata object for any page.
 */
export function buildMetadata({
  title,
  description,
  path = '/',
  image,
  keywords = [],
  noIndex = false,
  type = 'website',
}: {
  title: string
  description?: string
  path?: string
  image?: string
  keywords?: string[]
  noIndex?: boolean
  type?: 'website' | 'article'
}): Metadata {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
  const desc = description || SITE_DESCRIPTION
  const url = `${SITE_URL}${path}`
  const ogImage = image || OG_IMAGE

  return {
    title: fullTitle,
    description: desc,
    keywords: [...SITE_KEYWORDS, ...keywords],
    authors: [{ name: 'VendoorX Team', url: SITE_URL }],
    creator: 'VendoorX',
    publisher: 'VendoorX',
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
      languages: {
        'en-NG': url,
        'en': url,
      },
    },
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: SITE_NAME,
      type,
      locale: 'en_NG',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: desc,
      site: SITE_TWITTER,
      creator: SITE_TWITTER,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
  }
}

/** Organisation JSON-LD schema for the whole site */
export const ORGANISATION_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'VendoorX',
  alternateName: ['Vendoor', 'VendoorX Nigeria', 'Vendoorx'],
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512`,
  description: SITE_DESCRIPTION,
  foundingDate: '2024',
  foundingLocation: 'Nigeria',
  areaServed: 'Nigeria',
  sameAs: [
    'https://twitter.com/vendoorx',
    'https://instagram.com/vendoorx',
    'https://facebook.com/vendoorx',
    'https://wa.me/vendoorx',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    availableLanguage: ['English', 'Yoruba', 'Igbo', 'Hausa'],
  },
}

/** WebSite JSON-LD with sitelinks searchbox */
export const WEBSITE_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'VendoorX',
  alternateName: 'Vendoor',
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  inLanguage: 'en-NG',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/marketplace?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

/** Marketplace JSON-LD for the main marketplace page */
export const MARKETPLACE_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'VendoorX Marketplace — Buy & Sell on WhatsApp',
  description: 'Browse thousands of products from verified vendors across Nigeria. Shop electronics, fashion, food, textbooks and more on VendoorX.',
  url: `${SITE_URL}/marketplace`,
}
