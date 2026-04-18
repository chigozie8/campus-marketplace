import type { Metadata } from 'next'
import lazyLoad from 'next/dynamic'
import { buildMetadata, SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/seo'
import { createClient } from '@/lib/supabase/server'
import { getSiteSettings } from '@/lib/site-settings'

/* ── Above the fold — eager imports (critical for LCP) ── */
import { LandingNav } from '@/components/landing/landing-nav'
import { HeroSection } from '@/components/landing/hero-section'
import { StatsBar } from '@/components/landing/stats-bar'

/* ── Below the fold — lazy JS chunks (faster initial bundle) ── */
const TrustedBySection      = lazyLoad(() => import('@/components/landing/trusted-by-section').then(m => ({ default: m.TrustedBySection })))
const ProblemSolutionSection = lazyLoad(() => import('@/components/landing/problem-solution-section').then(m => ({ default: m.ProblemSolutionSection })))
const WhatsappMockupSection  = lazyLoad(() => import('@/components/landing/whatsapp-mockup-section').then(m => ({ default: m.WhatsappMockupSection })))
const HowItWorksSection      = lazyLoad(() => import('@/components/landing/how-it-works-section').then(m => ({ default: m.HowItWorksSection })))
const Features               = lazyLoad(() => import('@/components/landing/features').then(m => ({ default: m.Features })))
const IntegrationsSection    = lazyLoad(() => import('@/components/landing/integrations-section').then(m => ({ default: m.IntegrationsSection })))
const TrustSection           = lazyLoad(() => import('@/components/landing/trust-section').then(m => ({ default: m.TrustSection })))
const FaqSection             = lazyLoad(() => import('@/components/landing/faq-section').then(m => ({ default: m.FaqSection })))
const CtaSection             = lazyLoad(() => import('@/components/landing/cta-section').then(m => ({ default: m.CtaSection })))
const LandingFooter          = lazyLoad(() => import('@/components/landing/landing-footer').then(m => ({ default: m.LandingFooter })))

export const dynamic = 'force-dynamic'

export const metadata: Metadata = buildMetadata({
  title: 'VendoorX — AI-Powered WhatsApp Commerce Platform | Automate Sales on WhatsApp',
  description:
    'VendoorX is a conversational commerce platform that automates sales, support, and transactions across messaging channels. Let AI handle customer conversations, product discovery, order flow, and payments via WhatsApp. Free to start, zero commission.',
  path: '/',
  keywords: [
    'WhatsApp commerce Nigeria',
    'AI WhatsApp seller Nigeria',
    'conversational commerce Nigeria',
    'sell on WhatsApp Nigeria',
    'WhatsApp business automation Nigeria',
    'AI sales automation Nigeria',
    'WhatsApp store Nigeria',
    'chat commerce Nigeria',
    'automated WhatsApp orders Nigeria',
    'WhatsApp payment Nigeria',
    'ecommerce chatbot Nigeria',
    'AI-powered marketplace Nigeria',
    'sell online Nigeria free',
    'online marketplace Nigeria',
    'multi-platform commerce Nigeria',
    'WhatsApp buyer seller platform',
    'zero commission marketplace Nigeria',
    'AI customer service Nigeria',
    'WhatsApp order management',
    'VendoorX',
    'vendoorx Nigeria',
  ],
})

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'OnlineStore',
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  logo: `${SITE_URL}/icon.svg`,
  image: `${SITE_URL}/og-image.png`,
  priceRange: 'Free',
  currenciesAccepted: 'NGN',
  paymentAccepted: 'Cash, Bank Transfer, Paystack',
  areaServed: {
    '@type': 'Country',
    name: 'Nigeria',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'VendoorX Marketplace Listings',
    itemListElement: [
      { '@type': 'OfferCatalog', name: 'Electronics & Gadgets' },
      { '@type': 'OfferCatalog', name: 'Books & Stationery' },
      { '@type': 'OfferCatalog', name: 'Fashion & Clothing' },
      { '@type': 'OfferCatalog', name: 'Food & Drinks' },
      { '@type': 'OfferCatalog', name: 'Services & Freelance' },
      { '@type': 'OfferCatalog', name: 'Home & Furniture' },
      { '@type': 'OfferCatalog', name: 'Sports & Recreation' },
    ],
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '12500',
    bestRating: '5',
    worstRating: '1',
  },
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Marketplace', item: `${SITE_URL}/marketplace` },
    { '@type': 'ListItem', position: 3, name: 'Start Selling', item: `${SITE_URL}/seller/new` },
  ],
}

const softwareAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'VendoorX',
  operatingSystem: 'Web, Android, iOS',
  applicationCategory: 'ShoppingApplication',
  url: SITE_URL,
  description:
    'VendoorX is a conversational commerce platform that automates sales, support, and transactions across WhatsApp and messaging channels. AI handles customer conversations, product discovery, order flow, and payments via chat.',
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
    'WhatsApp-powered orders',
    'Zero platform commission',
    'AI customer conversation automation',
    'AI product discovery',
    'Automated order flow',
    'Payments via chat',
    'Paystack secure checkout',
    'Free forever plan',
    'Multi-platform — web, mobile & chat',
  ],
}

const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'VendoorX Marketplace Categories',
  description: 'Browse all categories on VendoorX — Nigeria\'s AI-powered WhatsApp commerce platform',
  url: `${SITE_URL}/marketplace`,
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Electronics', url: `${SITE_URL}/marketplace?category=electronics` },
    { '@type': 'ListItem', position: 2, name: 'Books & Stationery', url: `${SITE_URL}/marketplace?category=books` },
    { '@type': 'ListItem', position: 3, name: 'Fashion & Clothing', url: `${SITE_URL}/marketplace?category=fashion` },
    { '@type': 'ListItem', position: 4, name: 'Food & Drinks', url: `${SITE_URL}/marketplace?category=food` },
    { '@type': 'ListItem', position: 5, name: 'Furniture & Dorm', url: `${SITE_URL}/marketplace?category=furniture` },
    { '@type': 'ListItem', position: 6, name: 'Services', url: `${SITE_URL}/marketplace?category=services` },
    { '@type': 'ListItem', position: 7, name: 'Sports & Recreation', url: `${SITE_URL}/marketplace?category=sports` },
  ],
}

export default async function Home() {
  const [supabase, settings] = await Promise.all([
    createClient(),
    getSiteSettings(),
  ])
  const user = supabase ? (await supabase.auth.getUser()).data.user : null

  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <LandingNav user={user} />
      <HeroSection user={user} settings={settings} />
      <div data-aos="fade-up">
        <StatsBar stats={[
          { value: settings.stat_active_vendors, label: 'Active Vendors',   sublabel: settings.stat_active_vendors_sub },
          { value: settings.stat_campuses,        label: 'Nigerian Campuses', sublabel: settings.stat_campuses_sub },
          { value: settings.stat_transactions,    label: 'Sales Processed',   sublabel: settings.stat_transactions_sub },
          { value: settings.stat_rating,          label: 'Average Rating',    sublabel: settings.stat_rating_sub },
        ]} />
      </div>
      <div data-aos="fade-up"><TrustedBySection /></div>
      <div data-aos="fade-up"><ProblemSolutionSection /></div>
      <div data-aos="zoom-in-up" data-aos-duration="800"><WhatsappMockupSection /></div>
      <div data-aos="fade-up"><HowItWorksSection /></div>
      <div data-aos="fade-up"><Features /></div>
      <div data-aos="fade-up"><IntegrationsSection /></div>
      <div data-aos="fade-up"><TrustSection /></div>
      <div data-aos="fade-up"><FaqSection /></div>
      <div data-aos="zoom-in-up" data-aos-duration="800"><CtaSection user={user} /></div>
      <LandingFooter settings={settings} />
    </main>
  )
}
