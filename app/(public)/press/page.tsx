import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, Download, Mail, FileText, Phone,
  Smartphone, Sparkles, Award, Twitter, Linkedin,
  ExternalLink, Quote, Building2, Zap, Globe,
} from 'lucide-react'
import { getSiteSettings } from '@/lib/site-settings'
import { parsePressAssets, parseCoFounders } from '@/lib/site-settings-defaults'
import { CountUp } from '@/components/ui/count-up'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = buildMetadata({
  title: 'Newsroom | VendoorX',
  description:
    'VendoorX brand assets, company story, founder details, and media contact information — everything journalists and partners need in one place.',
  path: '/press',
  keywords: [
    'vendoorx press', 'vendoorx newsroom', 'vendoorx media kit',
    'nigeria whatsapp commerce news', 'vendoorx brand assets',
  ],
})

export default async function PressPage() {
  const settings = await getSiteSettings()
  const assets   = parsePressAssets(settings.press_assets)
  const cofounders = parseCoFounders(settings.press_cofounders)

  const STATS = [
    { value: settings.stat_active_vendors,  label: 'Active Vendors',  sub: settings.stat_active_vendors_sub },
    { value: settings.stat_campuses,         label: 'Universities',    sub: settings.stat_campuses_sub },
    { value: settings.stat_transactions,     label: 'Transactions',    sub: settings.stat_transactions_sub },
    { value: settings.stat_rating,           label: 'Avg Rating',      sub: settings.stat_rating_sub },
  ]

  const allFounders = [
    {
      name:       settings.press_founder_name,
      title:      settings.press_founder_title,
      initials:   settings.press_founder_initials,
      photo:      settings.press_founder_photo,
      bio:        [settings.press_founder_bio, settings.press_founder_bio2].filter(Boolean).join('\n\n'),
      quote:      settings.press_founder_quote,
      linkedinUrl: '',
      twitterUrl:  '',
    },
    ...cofounders,
  ]

  const quickFacts = [
    { label: 'Founded',        value: '2022',                        icon: Building2 },
    { label: 'Headquarters',   value: 'Victoria Island, Lagos',      icon: Globe },
    { label: 'Model',          value: 'WhatsApp Commerce SaaS',      icon: Zap },
    { label: 'Stage',          value: 'Growth — Series A Ready',     icon: Award },
  ]

  return (
    <div className="bg-background min-h-screen">

      {/* ── HERO BANNER ── */}
      <section className="relative overflow-hidden bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 lg:py-28">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 lg:gap-12">

            <div className="flex-1">
              <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-foreground leading-[0.92] tracking-tighter mb-5">
                News<span className="text-primary">room</span>
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-lg">
                Writing about VendoorX? We&apos;ve got everything you need — brand assets, key statistics, company background, founder details, and media contact.
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:items-end shrink-0">
              <a
                href={`mailto:${settings.press_contact_email}`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm transition-all"
              >
                <Mail className="w-4 h-4" />
                {settings.press_contact_email}
              </a>
              <Link
                href="/contact?subject=Press Enquiry"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-border hover:border-primary/60 text-foreground/80 hover:text-foreground font-semibold text-sm transition-all"
              >
                Send Press Enquiry <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {STATS.map(({ value, label, sub }, i) => (
              <div
                key={label}
                className={[
                  'flex flex-col items-center justify-center gap-1 py-10 px-4 text-center',
                  /* right border on every cell except last in row */
                  i % 2 === 0 ? 'border-r border-border' : '',
                  /* bottom border on first row of 2-col layout */
                  i < 2 ? 'border-b border-border lg:border-b-0' : '',
                  /* right border for lg 4-col (all except last) */
                  i < 3 ? 'lg:border-r lg:border-border' : 'lg:border-r-0',
                ].join(' ')}
              >
                <CountUp
                  value={value}
                  className="text-4xl sm:text-5xl font-black text-primary leading-none"
                />
                <p className="text-sm font-bold text-foreground mt-1">{label}</p>
                {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 flex flex-col gap-16 sm:gap-24">

        {/* ── COMPANY SNAPSHOT ── */}
        <section>
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">About</p>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground leading-tight">Company Snapshot</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Description card — white background with green left border */}
            <div className="lg:col-span-3 rounded-3xl bg-card border border-border p-7 sm:p-9 flex flex-col justify-between min-h-[200px] relative overflow-hidden">
              {/* Green accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-3xl" />
              <div className="pl-4">
                <p className="text-foreground text-base sm:text-lg leading-relaxed font-medium">
                  {settings.press_company_description}
                </p>
                <div className="mt-6 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-bold text-primary uppercase tracking-widest">Live Platform</span>
                </div>
              </div>
            </div>

            {/* Quick facts — white cards */}
            <div className="lg:col-span-2 grid grid-cols-1 gap-3">
              {quickFacts.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">{label}</p>
                    <p className="text-sm font-black text-foreground leading-tight">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOUNDERS ── */}
        <section>
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Leadership</p>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground leading-tight">
              {allFounders.length > 1 ? 'Founders & Leadership' : 'Founder & Leadership'}
            </h2>
          </div>

          <div className="flex flex-col gap-6">
            {allFounders.map((founder, idx) => (
              <article
                key={idx}
                className="group relative rounded-3xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all"
              >
                {/* Top accent line on hover */}
                <div className="absolute inset-x-0 top-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />

                <div className="flex flex-col sm:flex-row">

                  {/* Left column — avatar, name, socials */}
                  <div className="flex sm:flex-col items-center sm:items-center gap-5 sm:gap-5 p-6 sm:p-8 sm:w-56 lg:w-64 sm:border-b-0 border-b sm:border-r border-border shrink-0 bg-muted/20">

                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-2xl overflow-hidden ring-2 ring-border shadow-lg">
                        {founder.photo ? (
                          <Image
                            src={founder.photo}
                            alt={founder.name}
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary text-white text-2xl sm:text-3xl font-black">
                            {founder.initials || founder.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center shadow ring-2 ring-card">
                        <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                      </div>
                    </div>

                    {/* Name / title */}
                    <div className="sm:text-center min-w-0">
                      <h3 className="text-base sm:text-lg font-black text-foreground leading-tight">{founder.name}</h3>
                      <p className="text-xs sm:text-sm font-bold text-primary mt-0.5">{founder.title}</p>

                      {/* Socials — shown inline on mobile, stacked on sm+ */}
                      {(founder.linkedinUrl || founder.twitterUrl) && (
                        <div className="flex gap-2 mt-3 sm:justify-center">
                          {founder.linkedinUrl && (
                            <a
                              href={founder.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`${founder.name} on LinkedIn`}
                              className="w-8 h-8 rounded-lg border border-border hover:border-primary/40 bg-card flex items-center justify-center text-muted-foreground hover:text-primary transition-all"
                            >
                              <Linkedin className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {founder.twitterUrl && (
                            <a
                              href={founder.twitterUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`${founder.name} on X / Twitter`}
                              className="w-8 h-8 rounded-lg border border-border hover:border-primary/40 bg-card flex items-center justify-center text-muted-foreground hover:text-primary transition-all"
                            >
                              <Twitter className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Interview CTA — hidden on mobile row, shown on sm+ */}
                    <Link
                      href={`/contact?subject=Press+Enquiry+-+Interview+with+${encodeURIComponent(founder.name)}`}
                      className="hidden sm:flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs transition-all shadow-md shadow-primary/20"
                    >
                      <Sparkles className="w-3 h-3" />
                      Request Interview
                    </Link>

                  </div>

                  {/* Right column — quote + bio */}
                  <div className="flex-1 flex flex-col justify-center p-6 sm:p-8 min-w-0">
                    {founder.quote && (
                      <div className="mb-5 pl-4 border-l-4 border-primary">
                        <Quote className="w-6 h-6 text-primary/20 mb-2" />
                        <p className="text-base sm:text-lg font-bold text-foreground leading-relaxed italic">
                          &ldquo;{founder.quote}&rdquo;
                        </p>
                        <p className="text-primary text-xs font-bold mt-2">
                          — {founder.name}, {founder.title}
                        </p>
                      </div>
                    )}

                    {founder.bio && (
                      <div className="space-y-2.5">
                        {founder.bio.split('\n\n').filter(Boolean).map((para, i) => (
                          <p key={i} className="text-muted-foreground text-sm leading-relaxed">{para}</p>
                        ))}
                      </div>
                    )}

                    {/* Mobile-only interview CTA */}
                    <Link
                      href={`/contact?subject=Press+Enquiry+-+Interview+with+${encodeURIComponent(founder.name)}`}
                      className="sm:hidden mt-5 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs transition-all"
                    >
                      <Sparkles className="w-3 h-3" />
                      Request Interview
                    </Link>
                  </div>

                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── BRAND ASSETS ── */}
        <section>
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Resources</p>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground leading-tight">Brand Assets</h2>
            <p className="text-muted-foreground text-sm mt-2 max-w-xl">
              For editorial use only. Do not alter the logo or use it in ways that imply endorsement without written consent.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {assets.map(({ name, desc, size, url }) => (
              <div
                key={name}
                className="group flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{name}</p>
                    <p className="text-xs text-muted-foreground truncate">{desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-muted-foreground font-mono hidden sm:block">{size}</span>
                  {url ? (
                    <a
                      href={url}
                      download
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-bold transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </a>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground/50 text-xs font-bold">
                      <Download className="w-3.5 h-3.5" />
                      Soon
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── APP DOWNLOAD ── */}
        <section>
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Platform</p>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground leading-tight">Mobile App</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {[
              { store: 'App Store',    label: 'Download on the', bg: 'bg-primary',    url: settings.ios_download_url },
              { store: 'Google Play',  label: 'Get it on',       bg: 'bg-[#01875f]',  url: settings.apk_download_url },
            ].map(({ store, label, bg, url }) => (
              <div
                key={store}
                className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all"
              >
                <div className={`w-11 h-11 rounded-2xl ${bg} flex items-center justify-center shrink-0`}>
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-semibold">{label}</p>
                  <p className="text-base font-black text-foreground">{store}</p>
                </div>
                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-bold transition-all shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open
                  </a>
                ) : (
                  <span className="text-xs text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-lg shrink-0">
                    Soon
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="px-5 py-4 rounded-2xl bg-primary/5 border border-primary/15">
            <p className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground">PWA Available Now:</span>{' '}
              Install VendoorX from any browser — tap &ldquo;Add to Home Screen&rdquo; at{' '}
              <a href="https://vendoorx.ng" className="text-primary underline font-semibold">vendoorx.ng</a>
            </p>
          </div>
        </section>

        {/* ── MEDIA CONTACT ── */}
        <section>
          {/* White card with green left accent — contrasting with the rest */}
          <div className="rounded-3xl border border-border bg-card overflow-hidden">
            {/* Green header band */}
            <div className="bg-primary px-7 sm:px-10 py-5 flex items-center gap-3">
              <Mail className="w-5 h-5 text-white shrink-0" />
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">Media Enquiries</h2>
            </div>

            <div className="px-7 sm:px-10 py-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                <div className="max-w-md">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    For interview requests, press releases, product demos, or high-resolution photos, contact us directly. We respond within 2 business hours.
                  </p>
                </div>

                <div className="flex flex-col gap-3 shrink-0 lg:items-end">
                  <a
                    href={`mailto:${settings.press_contact_email}`}
                    className="flex items-center gap-3 px-5 py-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 text-foreground transition-all"
                  >
                    <Mail className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm font-semibold">{settings.press_contact_email}</span>
                  </a>
                  {settings.support_phone && (
                    <a
                      href={`tel:${settings.support_phone}`}
                      className="flex items-center gap-3 px-5 py-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 text-foreground transition-all"
                    >
                      <Phone className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm font-semibold">{settings.support_phone}</span>
                    </a>
                  )}
                  <Link
                    href="/contact?subject=Press Enquiry"
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm transition-all"
                  >
                    Send Press Enquiry <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
