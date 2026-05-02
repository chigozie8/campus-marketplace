import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, Download, Mail, FileText, Phone,
  Smartphone, Sparkles, Award, Twitter, Linkedin,
  ExternalLink, Quote,
} from 'lucide-react'
import { getSiteSettings } from '@/lib/site-settings'
import { parsePressAssets, parseCoFounders } from '@/lib/site-settings-defaults'
import { CountUp } from '@/components/ui/count-up'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = buildMetadata({
  title: 'Newsroom | VendoorX',
  description: 'VendoorX brand assets, company story, founder details, and media contact information — everything journalists and partners need in one place.',
  path: '/press',
  keywords: ['vendoorx press', 'vendoorx newsroom', 'vendoorx media kit', 'nigeria whatsapp commerce news', 'vendoorx brand assets'],
})

export default async function PressPage() {
  const settings = await getSiteSettings()
  const assets = parsePressAssets(settings.press_assets)
  const cofounders = parseCoFounders(settings.press_cofounders)

  const STATS = [
    { value: settings.stat_active_vendors, label: 'Active Vendors', sub: settings.stat_active_vendors_sub },
    { value: settings.stat_campuses,        label: 'Universities',   sub: settings.stat_campuses_sub },
    { value: settings.stat_transactions,    label: 'Transactions',   sub: settings.stat_transactions_sub },
    { value: settings.stat_rating,          label: 'Avg Rating',     sub: settings.stat_rating_sub },
  ]

  // All founders: the primary founder + any co-founders
  const allFounders = [
    {
      name: settings.press_founder_name,
      title: settings.press_founder_title,
      initials: settings.press_founder_initials,
      photo: settings.press_founder_photo,
      bio: [settings.press_founder_bio, settings.press_founder_bio2].filter(Boolean).join('\n\n'),
      quote: settings.press_founder_quote,
      linkedinUrl: '',
      twitterUrl: '',
      isPrimary: true,
    },
    ...cofounders.map(cf => ({ ...cf, isPrimary: false })),
  ]

  return (
    <div className="bg-background min-h-screen">

      {/* ── HERO BANNER ── */}
      <section className="relative overflow-hidden bg-foreground text-primary-foreground">
        {/* Decorative green stripe */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-8">
                <FileText className="w-3 h-3" />
                Media &amp; Press
              </div>
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tight mb-6">
                News<span className="text-primary">room</span>
              </h1>
              <p className="text-white/60 text-base sm:text-lg leading-relaxed max-w-xl">
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
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-white/20 hover:border-primary/60 text-white/80 hover:text-white font-semibold text-sm transition-all"
              >
                Send Press Enquiry <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom border accent */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
      </section>

      {/* ── STATS STRIP ── */}
      <section className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
            {STATS.map(({ value, label, sub }) => (
              <div key={label} className="flex flex-col items-center justify-center gap-1 py-10 px-4 text-center group">
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 flex flex-col gap-20 sm:gap-28">

        {/* ── COMPANY SNAPSHOT ── */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">About</p>
              <h2 className="text-3xl sm:text-4xl font-black text-foreground leading-tight">Company Snapshot</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Big text block */}
            <div className="lg:col-span-3 rounded-3xl bg-foreground p-8 sm:p-10 flex flex-col justify-between min-h-[220px]">
              <div className="w-10 h-1 bg-primary rounded-full mb-8" />
              <p className="text-white/80 text-base sm:text-lg leading-relaxed">
                {settings.press_company_description}
              </p>
              <div className="mt-8 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Live Platform</span>
              </div>
            </div>
            {/* Quick facts */}
            <div className="lg:col-span-2 grid grid-cols-1 gap-4">
              {[
                { label: 'Founded', value: '2022' },
                { label: 'Headquarters', value: 'Victoria Island, Lagos' },
                { label: 'Model', value: 'WhatsApp Commerce SaaS' },
                { label: 'Stage', value: 'Growth — Series A Ready' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-5 py-4 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{label}</span>
                  <span className="text-sm font-black text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOUNDERS ── */}
        <section>
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Leadership</p>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground leading-tight">
              Founder{allFounders.length > 1 ? 's' : ''} &amp; Leadership
            </h2>
          </div>

          <div className="flex flex-col gap-8">
            {allFounders.map((founder, idx) => (
              <article
                key={idx}
                className="group relative overflow-hidden rounded-3xl border border-border bg-card hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5"
              >
                {/* Top accent */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex flex-col lg:flex-row">
                  {/* Left — avatar column */}
                  <div className="flex flex-col items-center gap-6 p-8 lg:p-10 lg:w-72 lg:border-r lg:border-border shrink-0 bg-muted/30">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-3xl overflow-hidden ring-2 ring-border shadow-xl">
                        {founder.photo ? (
                          <Image
                            src={founder.photo}
                            alt={founder.name}
                            width={160}
                            height={160}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-foreground text-white text-4xl font-black">
                            {founder.initials || founder.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                        )}
                      </div>
                      {/* Badge */}
                      <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-lg ring-2 ring-card">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    {/* Name & title */}
                    <div className="text-center">
                      <h3 className="text-xl font-black text-foreground leading-tight">{founder.name}</h3>
                      <p className="text-sm font-bold text-primary mt-1">{founder.title}</p>
                    </div>

                    {/* Social links */}
                    {(founder.linkedinUrl || founder.twitterUrl) && (
                      <div className="flex gap-3">
                        {founder.linkedinUrl && (
                          <a
                            href={founder.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-xl border border-border hover:border-primary/40 bg-card flex items-center justify-center text-muted-foreground hover:text-primary transition-all"
                            aria-label={`${founder.name} on LinkedIn`}
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                        {founder.twitterUrl && (
                          <a
                            href={founder.twitterUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-xl border border-border hover:border-primary/40 bg-card flex items-center justify-center text-muted-foreground hover:text-primary transition-all"
                            aria-label={`${founder.name} on X / Twitter`}
                          >
                            <Twitter className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Interview CTA */}
                    <Link
                      href={`/contact?subject=Press Enquiry — Interview with ${encodeURIComponent(founder.name)}`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs transition-all shadow-md shadow-primary/20"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Request Interview
                    </Link>
                  </div>

                  {/* Right — content column */}
                  <div className="flex-1 flex flex-col justify-center p-8 lg:p-10 min-w-0">
                    {/* Pull quote */}
                    {founder.quote && (
                      <div className="mb-8 pl-5 border-l-4 border-primary">
                        <Quote className="w-8 h-8 text-primary/20 mb-3" />
                        <p className="text-lg sm:text-xl font-bold text-foreground leading-relaxed italic">
                          {founder.quote}
                        </p>
                        <p className="text-primary text-xs font-bold mt-3">
                          — {founder.name}, {founder.title}
                        </p>
                      </div>
                    )}

                    {/* Bio */}
                    {founder.bio && (
                      <div className="space-y-3">
                        {founder.bio.split('\n\n').filter(Boolean).map((para, i) => (
                          <p key={i} className="text-muted-foreground text-sm leading-relaxed">{para}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── BRAND ASSETS ── */}
        <section>
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Resources</p>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground leading-tight">Brand Assets</h2>
            <p className="text-muted-foreground text-sm mt-3 max-w-xl">
              For editorial use only. Do not alter the logo or use it in ways that imply endorsement without written consent.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {assets.map(({ name, desc, size, url }) => (
              <div
                key={name}
                className="group flex items-center justify-between gap-4 px-6 py-5 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                    <FileText className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
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
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground/50 text-xs font-bold cursor-not-allowed">
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
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Platform</p>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground leading-tight">Mobile App</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {[
              { store: 'App Store', label: 'Download on the', bg: 'bg-foreground', url: settings.ios_download_url },
              { store: 'Google Play', label: 'Get it on', bg: 'bg-[#01875f]', url: settings.apk_download_url },
            ].map(({ store, label, bg, url }) => (
              <div key={store} className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors">
                <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center shrink-0`}>
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-semibold">{label}</p>
                  <p className="text-base font-black text-foreground">{store}</p>
                </div>
                {url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-bold transition-all shrink-0">
                    <ExternalLink className="w-3.5 h-3.5" /> Open
                  </a>
                ) : (
                  <span className="text-xs text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-lg shrink-0">
                    Soon
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="p-5 rounded-2xl bg-primary/5 border border-primary/15">
            <p className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground">PWA Available Now:</span>{' '}
              Install VendoorX from any browser — tap &ldquo;Add to Home Screen&rdquo; at{' '}
              <a href="https://vendoorx.ng" className="text-primary underline font-semibold">vendoorx.ng</a>
            </p>
          </div>
        </section>

        {/* ── MEDIA CONTACT ── */}
        <section>
          <div className="rounded-3xl bg-foreground overflow-hidden">
            <div className="px-8 sm:px-12 py-10 sm:py-14">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div>
                  <div className="w-10 h-1 bg-primary rounded-full mb-6" />
                  <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
                    Media Enquiries
                  </h2>
                  <p className="text-white/60 text-sm leading-relaxed max-w-md">
                    For interview requests, press releases, product demos, or high-resolution photos, contact us directly. We respond within 2 business hours.
                  </p>
                </div>
                <div className="flex flex-col gap-3 shrink-0">
                  <a
                    href={`mailto:${settings.press_contact_email}`}
                    className="flex items-center gap-3 px-5 py-3 rounded-xl border border-white/10 hover:border-primary/40 text-white hover:text-primary transition-all"
                  >
                    <Mail className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm font-semibold">{settings.press_contact_email}</span>
                  </a>
                  <a
                    href={`tel:${settings.support_phone}`}
                    className="flex items-center gap-3 px-5 py-3 rounded-xl border border-white/10 hover:border-primary/40 text-white hover:text-primary transition-all"
                  >
                    <Phone className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm font-semibold">{settings.support_phone}</span>
                  </a>
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
