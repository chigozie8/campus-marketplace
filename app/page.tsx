import type { Metadata } from 'next'
import lazyLoad from 'next/dynamic'
import { buildMetadata, SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/seo'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
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
const CategoriesSection      = lazyLoad(() => import('@/components/landing/categories-section').then(m => ({ default: m.CategoriesSection })))
const TestimonialsSection    = lazyLoad(() => import('@/components/landing/testimonials-section').then(m => ({ default: m.TestimonialsSection })))
const TrustSection           = lazyLoad(() => import('@/components/landing/trust-section').then(m => ({ default: m.TrustSection })))
const PricingSection         = lazyLoad(() => import('@/components/landing/pricing-section').then(m => ({ default: m.PricingSection })))
const FaqSection             = lazyLoad(() => import('@/components/landing/faq-section').then(m => ({ default: m.FaqSection })))
const CtaSection             = lazyLoad(() => import('@/components/landing/cta-section').then(m => ({ default: m.CtaSection })))
const LandingFooter          = lazyLoad(() => import('@/components/landing/landing-footer').then(m => ({ default: m.LandingFooter })))

async function getPricingPlans() {
  try {
    const admin = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } },
    )
    const { data } = await admin
      .from('pricing_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    return data ?? []
  } catch {
    return []
  }
}

export const dynamic = 'force-dynamic'

export const metadata: Metadata = buildMetadata({
  title: "VendoorX — Nigeria's #1 Campus Marketplace | Buy & Sell on Campus",
  description:
    "VendoorX is Nigeria's #1 campus marketplace. Buy and sell electronics, textbooks, fashion, food & services on WhatsApp across 120+ universities — UNILAG, UI, OAU, FUTA, ABU and more. Zero commission, free forever.",
  path: '/',
  keywords: [
    'campus marketplace Nigeria',
    'buy and sell university Nigeria',
    'student seller Nigeria',
    'UNILAG OAU UI student market',
    'WhatsApp student commerce',
    'sell textbooks campus',
    'cheap electronics campus Nigeria',
    'Nigerian student ecommerce',
    'free campus marketplace',
    'student marketplace app Nigeria',
    'buy sell swap campus Nigeria',
    'UNILAG marketplace',
    'OAU marketplace',
    'UI Ibadan student market',
    'FUTA marketplace',
    'ABU Zaria student market',
    'LASU marketplace',
    'UNIBEN student market',
    'UNIPORT marketplace',
    'campus deals Nigeria',
    'zero commission marketplace',
    'WhatsApp store Nigeria',
    'sell online Nigeria free',
    'student business Nigeria',
    'campus vendor Nigeria',
    'buy second hand items campus',
    'online market for students Nigeria',
    'campus ecommerce app',
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
    name: 'Campus Marketplace Listings',
    itemListElement: [
      { '@type': 'OfferCatalog', name: 'Electronics & Gadgets' },
      { '@type': 'OfferCatalog', name: 'Textbooks & Stationery' },
      { '@type': 'OfferCatalog', name: 'Fashion & Clothing' },
      { '@type': 'OfferCatalog', name: 'Food & Drinks' },
      { '@type': 'OfferCatalog', name: 'Services & Freelance' },
      { '@type': 'OfferCatalog', name: 'Accommodation & Furniture' },
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
    { '@type': 'ListItem', position: 3, name: 'Sell on Campus', item: `${SITE_URL}/seller/new` },
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
    "Nigeria's #1 campus marketplace app. Buy and sell on WhatsApp with zero commission fees across 120+ Nigerian universities.",
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
    'Verified student sellers',
    'Campus-based trading',
    'Paystack secure checkout',
    'Free forever plan',
    '120+ Nigerian universities',
  ],
}

const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'VendoorX Campus Marketplace Categories',
  description: 'Browse all categories on VendoorX — Nigeria\'s #1 campus marketplace',
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
  const [supabase, settings, plans] = await Promise.all([
    createClient(),
    getSiteSettings(),
    getPricingPlans(),
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
      <StatsBar stats={[
        { value: settings.stat_active_vendors, label: 'Active Vendors',   sublabel: settings.stat_active_vendors_sub },
        { value: settings.stat_campuses,        label: 'Nigerian Campuses', sublabel: settings.stat_campuses_sub },
        { value: settings.stat_transactions,    label: 'Sales Processed',   sublabel: settings.stat_transactions_sub },
        { value: settings.stat_rating,          label: 'Average Rating',    sublabel: settings.stat_rating_sub },
      ]} />
      <TrustedBySection />
      <ProblemSolutionSection />
      <WhatsappMockupSection />
      <HowItWorksSection />
      <Features />
      <IntegrationsSection />
      <CategoriesSection />
      <TestimonialsSection />
      <TrustSection />
      <PricingSection plans={plans} />
      <FaqSection />
      <CtaSection user={user} />
      <LandingFooter settings={settings} />
    </main>
  )
}
