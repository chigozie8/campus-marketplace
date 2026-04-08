import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Download, Mail, FileText, Phone, Smartphone, Quote } from 'lucide-react'
import { getSiteSettings } from '@/lib/site-settings'
import { parsePressAssets } from '@/lib/site-settings-defaults'

export const metadata: Metadata = {
  title: 'Press Kit | VendoorX',
  description: 'Download VendoorX brand assets, logos, and media kit for press coverage. Contact our CEO Kenneth Okoronkwo for interview requests.',
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
          <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-4">Press Kit</h1>
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

          {/* ── Founder section ── */}
          <div>
            <h2 className="text-xl font-black text-foreground mb-6">Founder &amp; Leadership</h2>
            <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl border border-border bg-card">
              {/* Avatar */}
              <div className="shrink-0 flex flex-col items-center sm:items-start gap-3">
                {settings.press_founder_photo ? (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg">
                    <Image
                      src={settings.press_founder_photo}
                      alt={settings.press_founder_name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #16a34a 0%, #0d9488 100%)' }}
                  >
                    {settings.press_founder_initials}
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <a
                    href="tel:+15792583013"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Phone className="w-3 h-3" /> +1 (579) 258-3013
                  </a>
                  <a
                    href={`mailto:${settings.press_contact_email}`}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Mail className="w-3 h-3" /> {settings.press_contact_email}
                  </a>
                </div>
              </div>

              {/* Bio */}
              <div className="flex-1 min-w-0">
                <div className="mb-1">
                  <h3 className="text-xl font-black text-foreground">{settings.press_founder_name}</h3>
                  <p className="text-sm font-bold text-primary">{settings.press_founder_title}</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                  {settings.press_founder_bio}
                </p>
                {settings.press_founder_bio2 && (
                  <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                    {settings.press_founder_bio2}
                  </p>
                )}

                {/* Quote */}
                {settings.press_founder_quote && (
                  <div className="mt-5 pl-4 border-l-2 border-primary">
                    <Quote className="w-4 h-4 text-primary/50 mb-1" />
                    <p className="text-sm italic text-foreground leading-relaxed">
                      &ldquo;{settings.press_founder_quote}&rdquo;
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 font-semibold">— {settings.press_founder_name}, {settings.press_founder_title}</p>
                  </div>
                )}
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
