import { createClient } from '@/lib/supabase/server'
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
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooter } from '@/components/landing/landing-footer'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main className="min-h-screen bg-background">
      <LandingNav user={user} />
      <HeroSection />
      <StatsBar />
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
