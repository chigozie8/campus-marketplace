import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooterServer } from '@/components/landing/landing-footer-server'
import { getSiteSettings } from '@/lib/site-settings'
import { CtaSection } from '@/components/landing/cta-section'

export const metadata: Metadata = {
  title: 'Seller Reviews — VendoorX',
  description: 'See what real Nigerian sellers are saying about VendoorX. Thousands of verified vendors across Lagos, Abuja, Port Harcourt and beyond are making real income every day.',
}

export default async function ReviewsPage() {
  const [supabase, settings] = await Promise.all([
    createClient(),
    getSiteSettings(),
  ])
  const user = supabase ? (await supabase.auth.getUser()).data.user : null

  return (
    <main className="min-h-screen bg-background">
      <LandingNav user={user} />
      <div className="pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-2 text-center">
          <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight mb-3">
            Real Sellers. Real Results.
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Thousands of Nigerian vendors across every city and industry are making real income on VendoorX. Here&apos;s what they&apos;re saying.
          </p>
        </div>
        <TestimonialsSection />
        <CtaSection user={user} />
      </div>
      <LandingFooterServer settings={settings} />
    </main>
  )
}
