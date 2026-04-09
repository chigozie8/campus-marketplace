import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Download, Mail, FileText, Phone, Smartphone, Sparkles, Award, TrendingUp } from 'lucide-react'
import { getSiteSettings } from '@/lib/site-settings'
import { parsePressAssets } from '@/lib/site-settings-defaults'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Newsroom | VendoorX',
  description: 'VendoorX brand assets, company story, founder details, and media contact information. Everything journalists and partners need in one place.',
}

export default async function PressPage() {
  const settings = await getSiteSettings()
  const assets = parsePressAssets(settings.press_assets)

  const STATS = [
    { value: settings.stat_active_vendors, label: 'Active Vendors' },
    { value: settings.stat_campuses,        label: 'Nigerian Campuses' },
    { value: settings.stat_transactions,    label: 'Transactions Processed' },
    { value: settings.stat_rating,          label: 'Average Rating' },
  ]

  return (
    <div className="bg-background">

      {/* ── Hero ── */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 via-background to-background dark:from-gray-900/30 border-b border-border">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border text-muted-foreground text-xs font-bold uppercase tracking-widest mb-6">
            <FileText className="w-3.5 h-3.5" />
            Media &amp; Press
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-4">Newsroom</h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
            Writing about VendoorX? We&apos;ve got everything you need — brand assets, key statistics, company background, founder details, and media contact information.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto flex flex-col gap-14">

          {/* ── Company snapshot ── */}
          <div>
            <h2 className="text-xl font-black text-foreground mb-5">Company Snapshot</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {STATS.map(({ value, label }) => (
                <div key={label} className="rounded-xl border border-border bg-card p-4 text-center">
                  <p className="text-2xl font-black text-primary">{value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {settings.press_company_description}
            </p>
          </div>

          {/* ── Founder section — REDESIGNED ── */}
          <div>
            <h2 className="text-xl font-black text-foreground mb-6">Founder &amp; Leadership</h2>

            {/* Main card — clean white */}
            <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-card border border-border shadow-xl">

              {/* Subtle top accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-emerald-400 to-primary/60 rounded-t-3xl" />

              <div className="relative flex flex-col lg:flex-row gap-0">

                {/* Left column — avatar + name + contact */}
                <div className="flex flex-col items-center lg:items-start gap-5 p-8 lg:p-10 lg:w-72 lg:border-r lg:border-border lg:shrink-0 bg-gray-50 dark:bg-muted/30 rounded-tl-3xl rounded-bl-none lg:rounded-bl-3xl rounded-tr-none lg:rounded-tr-none">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="absolute inset-0 scale-110 rounded-3xl bg-primary/20 blur-xl" />
                    <div className="relative w-28 h-28 lg:w-36 lg:h-36 rounded-3xl overflow-hidden ring-2 ring-primary/30 shadow-lg">
                      {settings.press_founder_photo ? (
                        <Image
                          src={settings.press_founder_photo}
                          alt={settings.press_founder_name}
                          width={144}
                          height={144}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-white text-4xl font-black"
                          style={{ background: 'linear-gradient(135deg, #16a34a 0%, #0d9488 60%, #0891b2 100%)' }}
                        >
                          {settings.press_founder_initials}
                        </div>
                      )}
                    </div>
                    {/* Verified badge */}
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-md ring-2 ring-white dark:ring-card">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Name & title */}
                  <div className="text-center lg:text-left">
                    <h3 className="text-2xl font-black text-foreground leading-tight">{settings.press_founder_name}</h3>
                    <p className="text-sm font-bold text-primary mt-1">{settings.press_founder_title}</p>
                  </div>

                  {/* Achievement chips */}
                  <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
                      <TrendingUp className="w-3 h-3" />
                      {settings.stat_active_vendors} Vendors
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                      {settings.stat_campuses} Campuses
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold">
                      {settings.stat_transactions} GMV
                    </span>
                  </div>

                  {/* Contact */}
                  <div className="flex flex-col gap-2 w-full">
                    <a
                      href={`mailto:${settings.press_contact_email}`}
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white dark:bg-muted hover:bg-primary/5 border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground text-xs font-semibold transition-all"
                    >
                      <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{settings.press_contact_email}</span>
                    </a>
                    <a
                      href="tel:+15792583013"
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white dark:bg-muted hover:bg-primary/5 border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground text-xs font-semibold transition-all"
                    >
                      <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                      +1 (579) 258-3013
                    </a>
                  </div>
                </div>

                {/* Right column — quote + bio */}
                <div className="flex-1 flex flex-col justify-center p-8 lg:p-10 min-w-0">

                  {/* Big quote */}
                  {settings.press_founder_quote && (
                    <div className="mb-8">
                      <div className="text-7xl font-black leading-none text-primary/20 select-none mb-3">&ldquo;</div>
                      <p className="text-xl sm:text-2xl font-bold text-foreground leading-relaxed italic">
                        {settings.press_founder_quote}
                      </p>
                      <div className="flex items-center gap-2 mt-4">
                        <div className="w-8 h-0.5 bg-primary rounded-full" />
                        <p className="text-primary text-xs font-bold">{settings.press_founder_name}, {settings.press_founder_title}</p>
                      </div>
                    </div>
                  )}

                  {/* Divider */}
                  {settings.press_founder_quote && (
                    <div className="w-full h-px bg-border mb-8" />
                  )}

                  {/* Bio */}
                  <div className="space-y-4">
                    {settings.press_founder_bio && (
                      <p className="text-muted-foreground text-sm leading-relaxed">{settings.press_founder_bio}</p>
                    )}
                    {settings.press_founder_bio2 && (
                      <p className="text-muted-foreground text-sm leading-relaxed">{settings.press_founder_bio2}</p>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="mt-8">
                    <Link
                      href={`/contact?subject=Press Enquiry — Interview Request`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm transition-all shadow-md shadow-primary/20"
                    >
                      <Sparkles className="w-4 h-4" />
                      Request an Interview
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── App Download ── */}
          <div>
            <h2 className="text-xl font-black text-foreground mb-3">Mobile App</h2>
            <p className="text-sm text-muted-foreground mb-6">
              VendoorX is available as a progressive web app (PWA) installable from any browser, with native iOS and Android apps coming soon.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center shrink-0">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Download on the</p>
                  <p className="text-base font-black text-foreground">App Store</p>
                  <span className="text-xs text-amber-600 font-semibold bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full">Coming Soon</span>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-[#01875f] flex items-center justify-center shrink-0">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Get it on</p>
                  <p className="text-base font-black text-foreground">Google Play</p>
                  <span className="text-xs text-amber-600 font-semibold bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full">Coming Soon</span>
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/15">
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground">PWA Available Now:</span> Users can install VendoorX directly from their browser — tap &quot;Add to Home Screen&quot; on any mobile device at{' '}
                <a href="https://vendoorx.com" className="text-primary underline font-semibold">vendoorx.com</a>
              </p>
            </div>
          </div>

          {/* ── Brand assets ── */}
          <div>
            <h2 className="text-xl font-black text-foreground mb-5">Brand Assets</h2>
            <div className="flex flex-col gap-3">
              {assets.map(({ name, desc, size, url }) => (
                <div key={name} className="flex items-center justify-between gap-4 px-5 py-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{name}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground font-mono">{size}</span>
                    {url ? (
                      <a
                        href={url}
                        download
                        className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </a>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground/50 cursor-not-allowed">
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Brand assets are available for editorial use only. Do not alter the logo or use it in ways that imply endorsement without prior written consent.
            </p>
          </div>

          {/* ── Media contact ── */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
            <h2 className="text-lg font-black text-foreground mb-2">Media Enquiries</h2>
            <p className="text-sm text-muted-foreground mb-5">
              For interview requests, press releases, product demos, or high-resolution photos, contact us directly:
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <a href={`mailto:${settings.press_contact_email}`} className="text-sm font-semibold text-primary hover:underline">
                  {settings.press_contact_email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <a href="tel:+15792583013" className="text-sm font-semibold text-primary hover:underline">+1 (579) 258-3013</a>
              </div>
            </div>
            <Link
              href="/contact?subject=Press Enquiry"
              className="inline-flex items-center gap-2 mt-5 px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm transition-all"
            >
              Send Press Enquiry <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>
    </div>
  )
}
