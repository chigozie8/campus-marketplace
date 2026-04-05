import { createClient } from '@/lib/supabase/server'
import { HeroSection } from '@/components/landing/hero-section'
import { WhatsappMockupSection } from '@/components/landing/whatsapp-mockup-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { HowItWorksSection } from '@/components/landing/how-it-works-section'
import { CategoriesSection } from '@/components/landing/categories-section'
import { TestimonialsSection } from '@/components/landing/testimonials-section'
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
      <WhatsappMockupSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CategoriesSection />
      <TestimonialsSection />
      <CtaSection />
      <LandingFooter />
    </main>
  )
}
