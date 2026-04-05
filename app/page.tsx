import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import { createClient } from '@/lib/supabase/server'
import { HeroSection } from '@/components/landing/hero-section'

export const metadata: Metadata = buildMetadata({
  title: "VendoorX — Nigeria's #1 Campus Marketplace | Buy & Sell on Campus",
  description:
    "VendoorX connects 50,000+ students across 120+ Nigerian universities. Buy and sell electronics, textbooks, fashion, food, and services. WhatsApp-powered, zero commission, free forever.",
  path: '/',
  keywords: [
    'campus marketplace Nigeria',
    'buy and sell university Nigeria',
    'student seller Nigeria',
    'UNILAG OAU UI student market',
    'WhatsApp student commerce',
    'sell textbooks campus',
    'cheap electronics campus Nigeria',
  ],
})
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
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooter } from '@/components/landing/landing-footer'

export default async function Home() {
  const supabase = await createClient()
  const user = supabase ? (await supabase.auth.getUser()).data.user : null

  return (
    <main className="min-h-screen bg-background">
      <LandingNav user={user} />
      <HeroSection />
      <StatsBar />
      <TrustedBySection />
      <ProblemSolutionSection />
      <WhatsappMockupSection />
      <HowItWorksSection />
      <Features />
      <IntegrationsSection />
      <CategoriesSection />
      <TestimonialsSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
      <LandingFooter />
    </main>
  )
}
