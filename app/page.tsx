import type { Metadata } from 'next'
import { buildMetadata, SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/seo'
import { createClient } from '@/lib/supabase/server'
import { getSiteSettings } from '@/lib/site-settings'
import { HeroSection } from '@/components/landing/hero-section'
import { StatsBar } from '@/components/landing/stats-bar'
import { ProblemSolutionSection } from '@/components/landing/problem-solution-section'
import { WhatsappMockupSection } from '@/components/landing/whatsapp-mockup-section'
import { HowItWorksSection } from '@/components/landing/how-it-works-section'
import { Features } from '@/components/landing/features'
import { IntegrationsSection } from '@/components/landing/integrations-section'
import { CategoriesSection } from '@/components/landing/categories-section'
import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { PricingSection } from '@/components/landing/pricing-section'
import { FaqSection } from '@/components/landing/faq-section'
import { CtaSection } from '@/components/landing/cta-section'
import { TrustedBySection } from '@/components/landing/trusted-by-section'
import { TrustSection } from '@/components/landing/trust-section'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooter } from '@/components/landing/landing-footer'

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
  const supabase = await createClient()
  const user = supabase ? (await supabase.auth.getUser()).data.user : null
  const settings = await getSiteSettings()

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
      <StatsBar />
      <TrustedBySection />
      <ProblemSolutionSection />
      <WhatsappMockupSection />
      <HowItWorksSection />
      <Features />
      <IntegrationsSection />
      <CategoriesSection />
      <TestimonialsSection />
      <TrustSection />
      <PricingSection />
      <FaqSection />
      <CtaSection user={user} />
      <LandingFooter settings={settings} />
    </main>
  )
}
