import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Handshake, Building2, Zap, Megaphone, ShieldCheck, Star, Heart, Globe } from 'lucide-react'
import { getSiteSettings } from '@/lib/site-settings'
import { parsePartnershipTypes } from '@/lib/site-settings-defaults'

export const metadata: Metadata = {
  title: 'Partnerships | VendoorX',
  description: "Partner with VendoorX to grow your reach across Nigeria's AI-powered WhatsApp commerce platform.",
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap, Building2, Megaphone, ShieldCheck, Star, Heart, Globe, Handshake,
}

const COLOR_MAP: Record<string, { text: string; bg: string; border: string }> = {
  green:  { text: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-950/30',   border: 'border-green-200 dark:border-green-900/40' },
  blue:   { text: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-950/30',     border: 'border-blue-200 dark:border-blue-900/40' },
  rose:   { text: 'text-rose-600',   bg: 'bg-rose-50 dark:bg-rose-950/30',     border: 'border-rose-200 dark:border-rose-900/40' },
  purple: { text: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-900/40' },
  amber:  { text: 'text-amber-600',  bg: 'bg-amber-50 dark:bg-amber-950/30',   border: 'border-amber-200 dark:border-amber-900/40' },
  teal:   { text: 'text-teal-600',   bg: 'bg-teal-50 dark:bg-teal-950/30',     border: 'border-teal-200 dark:border-teal-900/40' },
}

export default async function PartnershipsPage() {
  const settings = await getSiteSettings()
  const types     = parsePartnershipTypes(settings.partnerships_types)
  const heroTitle    = settings.partnerships_hero_title    || "Grow with VendoorX's commerce network."
  const heroSubtitle = settings.partnerships_hero_subtitle || "We're building a network of partners — brands, agencies, creators, and tech companies — who believe in the power of AI-driven commerce across messaging channels in Nigeria and beyond."
  const ctaTitle   = settings.partnerships_cta_title   || 'Ready to partner with us?'
  const ctaBody    = settings.partnerships_cta_body    || 'Tell us about your organisation and what you have in mind. Our partnerships team responds within 2 business days.'
  const ctaSubject = settings.partnerships_contact_subject || 'Partnership Enquiry'

  return (
    <div className="bg-background">
      <section className="py-20 px-4 bg-gradient-to-br from-teal-50 via-background to-background dark:from-teal-950/20 border-b border-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/40 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Handshake className="w-3.5 h-3.5" />
            Partnerships
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-5 leading-tight text-balance">
            {heroTitle.includes('commerce network') ? (
              <>
                {heroTitle.split('commerce network')[0]}
                <span className="text-primary">commerce network.</span>
              </>
            ) : heroTitle}
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
            {heroSubtitle}
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          {types.map(({ icon, title, desc, cta, color }) => {
            const Icon   = ICON_MAP[icon] ?? Zap
            const colors = COLOR_MAP[color] ?? COLOR_MAP.green
            return (
              <div key={title} className={`rounded-2xl border-2 ${colors.border} ${colors.bg} p-6 flex gap-5 items-start`}>
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-card flex items-center justify-center shrink-0 shadow-sm">
                  <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-black text-foreground mb-2">{title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{desc}</p>
                  <Link
                    href={`/contact?subject=${encodeURIComponent(title)}`}
                    className={`inline-flex items-center gap-1.5 text-sm font-bold ${colors.text} hover:underline`}
                  >
                    {cta} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        <div className="max-w-4xl mx-auto mt-14 text-center">
          <h2 className="text-2xl font-black text-foreground mb-3">{ctaTitle}</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">{ctaBody}</p>
          <Link
            href={`/contact?subject=${encodeURIComponent(ctaSubject)}`}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-base transition-all hover:scale-[1.02] shadow-xl shadow-primary/25"
          >
            Get in Touch <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
