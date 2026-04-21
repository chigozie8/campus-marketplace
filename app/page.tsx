import type { Metadata } from 'next'
import lazyLoad from 'next/dynamic'
import { buildMetadata, SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/seo'
import { createClient } from '@/lib/supabase/server'
import { getSiteSettings } from '@/lib/site-settings'
import { parseSectionVisibility, parseEscrowSteps, parseHiwSteps, parseFaqs } from '@/lib/site-settings-defaults'

/* ── Above the fold — eager imports (critical for LCP) ── */
import { LandingNav } from '@/components/landing/landing-nav'
import { HeroSection } from '@/components/landing/hero-section'
import { StatsBar } from '@/components/landing/stats-bar'

/* ── Below the fold — lazy JS chunks (faster initial bundle) ── */
const TrendingProducts       = lazyLoad(() => import('@/components/landing/trending-products').then(m => ({ default: m.TrendingProducts })))
const TrustedBySection       = lazyLoad(() => import('@/components/landing/trusted-by-section').then(m => ({ default: m.TrustedBySection })))
const ProblemSolutionSection = lazyLoad(() => import('@/components/landing/problem-solution-section').then(m => ({ default: m.ProblemSolutionSection })))
const WhatsappMockupSection  = lazyLoad(() => import('@/components/landing/whatsapp-mockup-section').then(m => ({ default: m.WhatsappMockupSection })))
const HowItWorksSection      = lazyLoad(() => import('@/components/landing/how-it-works-section').then(m => ({ default: m.HowItWorksSection })))
const Features               = lazyLoad(() => import('@/components/landing/features').then(m => ({ default: m.Features })))
const IntegrationsSection    = lazyLoad(() => import('@/components/landing/integrations-section').then(m => ({ default: m.IntegrationsSection })))
const TrustSection           = lazyLoad(() => import('@/components/landing/trust-section').then(m => ({ default: m.TrustSection })))
const EscrowFlowSection      = lazyLoad(() => import('@/components/landing/escrow-flow-section').then(m => ({ default: m.EscrowFlowSection })))
const FaqSection             = lazyLoad(() => import('@/components/landing/faq-section').then(m => ({ default: m.FaqSection })))
const CtaSection             = lazyLoad(() => import('@/components/landing/cta-section').then(m => ({ default: m.CtaSection })))
const LandingFooter          = lazyLoad(() => import('@/components/landing/landing-footer').then(m => ({ default: m.LandingFooter })))
const StickyMobileCta        = lazyLoad(() => import('@/components/landing/sticky-mobile-cta').then(m => ({ default: m.StickyMobileCta })))
const AdPopup                = lazyLoad(() => import('@/components/landing/ad-popup').then(m => ({ default: m.AdPopup })))

export const revalidate = 300

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
  priceRange: '₦',
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

  // Pull the visitor's campus + name for hero/footer personalization (optional).
  let visitorCampus: string | null = null
  let visitorFirstName: string | null = null
  if (supabase && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('university, full_name')
      .eq('id', user.id)
      .maybeSingle()
    visitorCampus = (profile?.university as string | undefined) ?? null
    const fullName = (profile?.full_name as string | undefined) ?? ''
    visitorFirstName = fullName.trim().split(/\s+/)[0] || null
  }

  const visible = parseSectionVisibility(settings.homepage_sections_visible)
  const trendingEnabled = settings.homepage_trending_enabled !== '0'
  const escrowSteps = parseEscrowSteps(settings.homepage_escrow_steps)
  const hiwSteps    = parseHiwSteps(settings.homepage_hiw_steps)
  const faqs        = parseFaqs(settings.homepage_faqs)

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
      <HeroSection user={user} settings={settings} visitorCampus={visitorCampus} />
      <StatsBar stats={[
        { value: settings.stat_active_vendors, label: 'Active Vendors',   sublabel: settings.stat_active_vendors_sub },
        { value: settings.stat_campuses,        label: 'Nigerian Campuses', sublabel: settings.stat_campuses_sub },
        { value: settings.stat_transactions,    label: 'Sales Processed',   sublabel: settings.stat_transactions_sub },
        { value: settings.stat_rating,          label: 'Average Rating',    sublabel: settings.stat_rating_sub },
      ]} />
      {visible.trending && trendingEnabled && <TrendingProducts />}
      {visible.trustedBy       && <TrustedBySection />}
      {visible.problemSolution && <ProblemSolutionSection />}
      {visible.whatsappMockup  && <WhatsappMockupSection />}
      {visible.howItWorks      && <HowItWorksSection title={settings.hiw_title} subtitle={settings.hiw_subtitle} steps={hiwSteps} />}
      {visible.features        && <Features />}
      {visible.integrations    && <IntegrationsSection />}
      {visible.trust           && <TrustSection />}
      {visible.escrow          && <EscrowFlowSection steps={escrowSteps} />}
      {visible.faq             && <FaqSection faqs={faqs} />}
      {visible.cta             && <CtaSection user={user} />}
      <LandingFooter
        settings={settings}
        userEmail={user?.email ?? null}
        userFirstName={visitorFirstName}
      />
      <StickyMobileCta isAuthed={!!user} />
      <AdPopup
        enabled={settings.ad_popup_enabled === '1' && (settings.ad_popup_title || '').trim().length > 0}
        title={settings.ad_popup_title || ''}
        body={settings.ad_popup_body || ''}
        imageUrl={settings.ad_popup_image_url || undefined}
        ctaLabel={settings.ad_popup_cta_label || undefined}
        ctaHref={settings.ad_popup_cta_href || undefined}
        delayMs={Number(settings.ad_popup_delay_ms ?? 3000) || 3000}
        autoCloseMs={Number(settings.ad_popup_auto_close_ms ?? 0) || 0}
        frequency={(settings.ad_popup_frequency as 'session' | 'once' | 'always') || 'session'}
      />
    </main>
  )
}
