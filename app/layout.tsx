import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { FloatingNav } from '@/components/floating-nav'
import { ServiceWorkerRegistration } from '@/components/service-worker-registration'
import { PwaInstallPrompt } from '@/components/pwa-install-prompt'
import { NavigationProgress } from '@/components/navigation-progress'
import { SplashScreen } from '@/components/splash-screen'
import { CookieConsent } from '@/components/cookie-consent'
import { ChatWidget } from '@/components/chat-widget'
import { PushNotificationPrompt } from '@/components/push-notification-prompt'
import { CapacitorInit } from '@/components/capacitor-init'
import { NetworkToast } from '@/components/network-toast'
import { SITE_URL, SITE_DESCRIPTION, SITE_KEYWORDS } from '@/lib/seo'
import { Providers } from '@/components/providers'
import { AuthHashHandler } from '@/components/auth-hash-handler'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' })

const siteUrl = SITE_URL

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'VendoorX — Nigeria\'s #1 WhatsApp Vendor Marketplace',
    template: '%s | VendoorX',
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: 'VendoorX Team', url: siteUrl }],
  creator: 'VendoorX',
  publisher: 'VendoorX',
  formatDetection: { email: false, address: false, telephone: false },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: [{ url: '/icon-192', sizes: '180x180' }],
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: siteUrl,
    siteName: 'VendoorX',
    title: 'VendoorX — Nigeria\'s #1 WhatsApp Vendor Marketplace',
    description:
      'VendoorX is Nigeria\'s leading WhatsApp vendor marketplace. Buy and sell with AI automation — browse products, place orders, pay securely, and track delivery all through WhatsApp. Join VendoorX today.',
    images: [
      {
        url: `${siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'VendoorX — Nigeria\'s #1 WhatsApp Vendor Marketplace',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VendoorX — Nigeria\'s #1 WhatsApp Vendor Marketplace',
    description:
      'VendoorX is Nigeria\'s #1 WhatsApp vendor marketplace. Buy & sell with AI. Thousands of vendors on VendoorX — electronics, fashion, food & more. Free to join.',
    images: [`${siteUrl}/opengraph-image`],
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
  alternates: { canonical: siteUrl },
  category: 'shopping',
  classification: 'Marketplace',
  referrer: 'origin-when-cross-origin',
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'VendoorX',
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#16a34a',
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
      alternateName: ['Vendoor', 'VendoorX Nigeria', 'Vendoorx', 'WhatsApp Vendor Marketplace Nigeria'],
      description: 'VendoorX is Nigeria\'s #1 WhatsApp vendor marketplace — buy and sell with AI-powered automation for product discovery, orders, payments, and delivery tracking.',
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
        'WhatsApp-powered commerce',
        'AI customer conversation automation',
        'AI-driven product discovery',
        'Automated order flow',
        'Payments via chat',
        'Multi-platform — web, mobile & chat',
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
          name: 'Who is VendoorX for?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'VendoorX is for any seller or business that wants to automate their sales and customer conversations on WhatsApp. Whether you are a solo entrepreneur, a small business, or a growing brand in Nigeria, VendoorX gives you the AI tools to sell, support customers, and collect payments — all through chat.',
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
        {
          '@type': 'Question',
          name: 'What is VendoorX?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'VendoorX is Nigeria\'s #1 AI-powered WhatsApp vendor marketplace. It lets vendors list products, receive orders, and collect payments directly through WhatsApp — with AI automating the entire conversation, from product discovery to delivery confirmation.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I become a vendor on VendoorX?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sign up for free at vendoorx.ng, complete your seller profile, and start listing your products. Your public store page is live instantly and buyers can contact you directly on WhatsApp.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is VendoorX available across Nigeria?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. VendoorX is available to buyers and vendors across all of Nigeria — including Lagos, Abuja, Port Harcourt, Ibadan, Kano, and all university campuses nationwide.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does escrow payment work on VendoorX?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'When a buyer pays on VendoorX, the funds are held securely in escrow. The money is only released to the vendor after the buyer confirms they have received their item. This protects both buyers and sellers from fraud.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I sell on VendoorX without a physical store?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Absolutely. VendoorX is designed for home-based vendors, students, and small businesses. You only need a phone and a WhatsApp number to start selling. No physical store, no website, no technical skills required.',
          },
        },
        {
          '@type': 'Question',
          name: 'What types of products can I sell on VendoorX?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'You can sell almost anything legal — electronics, fashion and clothing, food and drinks, textbooks, furniture, beauty products, sports items, services, and more. VendoorX supports all product categories.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is Vendoor and VendoorX the same thing?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Vendoor and VendoorX refer to the same platform — VendoorX (vendoorx.ng). The full brand name is VendoorX.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does VendoorX use AI?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'VendoorX uses AI to automate WhatsApp conversations between buyers and vendors — handling product discovery, answering buyer questions, processing orders, sending payment links, and confirming delivery. This lets vendors earn money even when they are not online.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does VendoorX work for campus and university students?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. VendoorX was built with Nigerian campus life in mind. Students can buy and sell within their campus community — from lecture notes and textbooks to food, fashion, electronics, and services — all through WhatsApp.',
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
        <link rel="dns-prefetch" href="https://lgslsxokxohqzgsheybd.supabase.co" />

        {/* ── Splash screen — runs synchronously before React so it appears on the very first paint ── */}
        <script dangerouslySetInnerHTML={{ __html: `
(function(){
  try {
    // Skip splash on coming-soon page
    var _p = window.location.pathname;
    if (_p === '/coming-soon') return;
    // Inject keyframe animations
    var st = document.createElement('style');
    st.textContent = [
      '@keyframes vx-drop{from{opacity:0;transform:scale(0.7) translateY(-10px)}to{opacity:1;transform:scale(1) translateY(0)}}',
      '@keyframes vx-rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}',
      '@keyframes vx-bounce{0%,80%,100%{transform:translateY(0);opacity:.5}40%{transform:translateY(-8px);opacity:1}}',
    ].join('');
    document.head.appendChild(st);

    // Build overlay
    var el = document.createElement('div');
    el.id = '__vx-splash';
    el.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity 420ms cubic-bezier(0.4,0,0.2,1);';

    el.innerHTML = [
      // Icon mark
      '<div style="position:relative;width:52px;height:52px;margin-bottom:20px;animation:vx-drop 0.5s cubic-bezier(0.34,1.56,0.64,1) both">',
        '<div style="position:absolute;top:0;left:0;width:36px;height:36px;border-radius:8px;background:#0a0a0a"></div>',
        '<div style="position:absolute;bottom:0;right:0;width:36px;height:36px;border-radius:8px;background:#16a34a;opacity:0.9"></div>',
      '</div>',
      // Wordmark
      '<div style="animation:vx-rise 0.5s 0.1s cubic-bezier(0.34,1.56,0.64,1) both">',
        '<span style="font-size:2.6rem;font-weight:900;letter-spacing:-0.05em;line-height:1;color:#0a0a0a;font-family:system-ui,sans-serif">',
          'Vendoor<span style="color:#16a34a">X</span>',
        '</span>',
      '</div>',
      // Tagline
      '<p style="margin-top:10px;font-size:10.5px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:#9ca3af;font-family:system-ui,sans-serif;animation:vx-rise 0.45s 0.22s ease-out both">WhatsApp Commerce</p>',
      // Progress bar track
      '<div id="__vx-track" style="margin-top:44px;width:180px;height:3px;border-radius:99px;background:#f0f0f0;overflow:hidden;animation:vx-rise 0.4s 0.3s ease-out both">',
        '<div id="__vx-bar" style="height:100%;width:0%;border-radius:99px;background:linear-gradient(90deg,#0a0a0a 0%,#16a34a 100%);transition:width 280ms cubic-bezier(0.4,0,0.2,1);box-shadow:0 0 8px rgba(22,163,74,.45)"></div>',
      '</div>',
      // Dots
      '<div style="position:absolute;bottom:36px;left:50%;transform:translateX(-50%);display:flex;gap:7px;animation:vx-rise 0.4s 0.4s ease-out both">',
        '<span style="width:6px;height:6px;border-radius:50%;background:#d1d5db;display:block;animation:vx-bounce 0.9s 0s ease-in-out infinite"></span>',
        '<span style="width:6px;height:6px;border-radius:50%;background:#16a34a;display:block;animation:vx-bounce 0.9s 0.18s ease-in-out infinite"></span>',
        '<span style="width:6px;height:6px;border-radius:50%;background:#d1d5db;display:block;animation:vx-bounce 0.9s 0.36s ease-in-out infinite"></span>',
      '</div>',
    ].join('');

    document.documentElement.appendChild(el);

    // Animate progress bar
    var bar = null;
    var steps = [[30,80],[55,200],[75,380],[90,560],[100,780]];
    steps.forEach(function(s){
      setTimeout(function(){
        if(!bar) bar = document.getElementById('__vx-bar');
        if(bar) bar.style.width = s[0] + '%';
      }, s[1]);
    });

    // Fade out and remove
    setTimeout(function(){
      var splash = document.getElementById('__vx-splash');
      if(splash){ splash.style.opacity = '0'; splash.style.pointerEvents = 'none'; }
    }, 1000);
    setTimeout(function(){
      var splash = document.getElementById('__vx-splash');
      if(splash && splash.parentNode){ splash.parentNode.removeChild(splash); }
    }, 1450);

  } catch(e) {}
})();
        `}} />

        {/* Structured data — inlined directly so crawlers see it in initial HTML */}
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
          <Providers>
            <AuthHashHandler />
            <CapacitorInit />
            <NetworkToast />
            <SplashScreen />
            <NavigationProgress />
            {children}
            <FloatingNav />
            <ServiceWorkerRegistration />
            <PwaInstallPrompt />
            <PushNotificationPrompt />
            <ChatWidget />
            <CookieConsent />
            <Toaster richColors position="top-right" />
            {process.env.NODE_ENV === 'production' && <Analytics />}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
