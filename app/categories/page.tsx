import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CategoriesSection } from '@/components/landing/categories-section'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooterServer } from '@/components/landing/landing-footer-server'
import { getSiteSettings } from '@/lib/site-settings'
import { CtaSection } from '@/components/landing/cta-section'

export const metadata: Metadata = {
  title: 'Shop by Category — VendoorX',
  description: 'Browse all product categories on VendoorX — Nigeria\'s #1 WhatsApp vendor marketplace. Electronics, fashion, food, textbooks, services and more.',
}

export default async function CategoriesPage() {
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
            Shop by Category
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Whatever you need — it&apos;s here. Browse every category on VendoorX and buy directly over WhatsApp.
          </p>
        </div>
        <CategoriesSection />
        <CtaSection user={user} />
      </div>
      <LandingFooterServer settings={settings} />
    </main>
  )
}
