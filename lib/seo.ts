import type { Metadata } from 'next'

export const SITE_NAME = 'VendoorX'
export const SITE_TAGLINE = "Nigeria's AI-Powered WhatsApp Commerce Platform"
export const SITE_DESCRIPTION =
  'VendoorX is a conversational commerce platform that automates sales, support, and transactions across messaging channels. Sell on WhatsApp with AI handling customer conversations, product discovery, order flow, and payments — all in one place.'
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://vendoorx.ng'
export const SITE_TWITTER = '@vendoorx'
export const OG_IMAGE = `${SITE_URL}/opengraph-image`

export const SITE_KEYWORDS = [
  'WhatsApp commerce Nigeria',
  'conversational commerce Nigeria',
  'AI-powered marketplace Nigeria',
  'sell on WhatsApp Nigeria',
  'WhatsApp store Nigeria',
  'AI sales automation Nigeria',
  'chat commerce Nigeria',
  'WhatsApp business automation',
  'ecommerce chatbot Nigeria',
  'AI WhatsApp seller Nigeria',
  'online marketplace Nigeria',
  'automated sales Nigeria',
  'WhatsApp payment Nigeria',
  'VendoorX',
  'vendoorx Nigeria',
  'sell online Nigeria',
  'buyer seller marketplace Nigeria',
  'multi-platform commerce Nigeria',
  'mobile commerce Nigeria',
  'WhatsApp order management',
  'AI customer service Nigeria',
  'zero commission marketplace Nigeria',
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
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512`,
  description: SITE_DESCRIPTION,
  sameAs: [
    'https://twitter.com/vendoorx',
    'https://instagram.com/vendoorx',
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
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/marketplace?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}
