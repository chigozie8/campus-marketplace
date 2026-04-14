import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { PricingSection } from '@/components/landing/pricing-section'
import { FaqSection } from '@/components/landing/faq-section'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooter } from '@/components/landing/landing-footer'
import { getSiteSettings } from '@/lib/site-settings'

export const metadata: Metadata = {
  title: 'Pricing — VendoorX',
  description: 'Simple, transparent pricing. Start free, upgrade when you\'re ready. Zero commission on every sale you make on VendoorX.',
}

export const dynamic = 'force-dynamic'

async function getPricingPlans() {
  try {
    const admin = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } },
    )
    const { data } = await admin.from('pricing_plans').select('*').eq('is_active', true).order('sort_order')
    return data ?? []
  } catch { return [] }
}

export default async function PricingPage() {
  const [supabase, settings, plans] = await Promise.all([
    createClient(),
    getSiteSettings(),
    getPricingPlans(),
  ])
  const user = supabase ? (await supabase.auth.getUser()).data.user : null

  return (
    <main className="min-h-screen bg-background">
      <LandingNav user={user} />
      <div className="pt-24">
        <PricingSection plans={plans} />
        <FaqSection />
      </div>
      <LandingFooter settings={settings} />
    </main>
  )
}
