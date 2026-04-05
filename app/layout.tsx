import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { FloatingNav } from '@/components/floating-nav'
import { ServiceWorkerRegistration } from '@/components/service-worker-registration'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vendoorx.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'VendoorX — Buy & Sell on Campus | Nigeria\'s #1 Student Marketplace',
    template: '%s | VendoorX',
  },
  description:
    'VendoorX is Nigeria\'s largest campus marketplace connecting 50,000+ students. Buy and sell electronics, fashion, books, food, and services. Close deals directly on WhatsApp with zero platform fees. Join free today!',
  keywords: [
    'VendoorX',
    'campus marketplace',
    'student marketplace Nigeria',
    'buy and sell on campus',
    'university marketplace',
    'WhatsApp commerce',
    'student deals',
    'campus trading',
    'Nigerian student marketplace',
    'sell on campus',
    'buy from students',
    'university buy sell',
    'UNILAG marketplace',
    'OAU marketplace',
    'UI marketplace',
    'FUTA marketplace',
    'Nigerian universities',
    'student entrepreneurs',
    'campus business',
    'zero commission marketplace',
  ],
  authors: [{ name: 'VendoorX Team', url: siteUrl }],
  creator: 'VendoorX',
  publisher: 'VendoorX',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: siteUrl,
    siteName: 'VendoorX',
    title: 'VendoorX — Buy & Sell on Campus | Nigeria\'s #1 Student Marketplace',
    description:
      'Join 50,000+ students on Nigeria\'s largest campus marketplace. Buy and sell electronics, fashion, books, food, and services directly on WhatsApp. Zero fees, instant connections!',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VendoorX - Nigeria\'s #1 Campus Marketplace',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VendoorX — Buy & Sell on Campus',
    description:
      'Nigeria\'s #1 campus marketplace. 50,000+ students trading electronics, fashion, books & more. Zero fees, WhatsApp direct deals!',
    images: ['/og-image.png'],
    creator: '@vendoorx',
    site: '@vendoorx',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  category: 'shopping',
  classification: 'Marketplace',
  referrer: 'origin-when-cross-origin',
  verification: {
    google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'VendoorX',
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#16a34a',
    'msapplication-config': '/browserconfig.xml',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#16a34a' },
    { media: '(prefers-color-scheme: dark)', color: '#15803d' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: 'light dark',
}

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'VendoorX',
      description: "Nigeria's #1 campus marketplace for students",
      publisher: {
        '@id': `${siteUrl}/#organization`,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/marketplace?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
      inLanguage: 'en-NG',
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'VendoorX',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        '@id': `${siteUrl}/#logo`,
        url: `${siteUrl}/logo.png`,
        contentUrl: `${siteUrl}/logo.png`,
        width: 512,
        height: 512,
        caption: 'VendoorX Logo',
      },
      image: { '@id': `${siteUrl}/#logo` },
      sameAs: [
        'https://twitter.com/vendoorx',
        'https://instagram.com/vendoorx',
        'https://facebook.com/vendoorx',
        'https://linkedin.com/company/vendoorx',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: ['English'],
      },
    },
    {
      '@type': 'WebApplication',
      '@id': `${siteUrl}/#webapp`,
      name: 'VendoorX',
      url: siteUrl,
      applicationCategory: 'ShoppingApplication',
      operatingSystem: 'Any',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'NGN',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '12500',
        bestRating: '5',
        worstRating: '1',
      },
      featureList: [
        'Free to join',
        'Zero commission fees',
        'WhatsApp integration',
        'Verified student sellers',
        'Campus-based trading',
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': `${siteUrl}/#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is VendoorX completely free to join?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes — joining VendoorX is 100% free. The Starter plan lets you list up to 10 products, generate WhatsApp order links, and receive buyers at zero cost, forever.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do I need a website to use VendoorX?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Not at all. VendoorX gives you a ready-made public store profile page you can share with anyone. No coding, no hosting, no setup.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do payments work on VendoorX?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'On the free Starter plan, payments are handled directly between you and your buyer. On Growth and Pro plans, you get Paystack integration so buyers can pay directly.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does VendoorX charge commission on my sales?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Never. VendoorX charges zero commission on any sale you make, regardless of your plan. Keep every naira you earn.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is VendoorX only for university students in Nigeria?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'VendoorX is focused on Nigerian campuses and university students, but anyone can use the platform. We currently serve 120+ campuses across Nigeria.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I cancel my subscription anytime?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. You can upgrade, downgrade, or cancel your subscription at any time from your dashboard settings.',
          },
        },
      ],
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased pb-24 lg:pb-0`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <FloatingNav />
          <ServiceWorkerRegistration />
          <Toaster richColors position="top-right" />
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  )
}
