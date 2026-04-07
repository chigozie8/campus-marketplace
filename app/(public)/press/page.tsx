import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Download, Mail, FileText, Phone, Smartphone, Quote } from 'lucide-react'
import { getSiteSettings } from '@/lib/site-settings'

export const metadata: Metadata = {
  title: 'Press Kit | VendoorX',
  description: 'Download VendoorX brand assets, logos, and media kit for press coverage. Contact our CEO Kenneth Okoronkwo for interview requests.',
}

const ASSETS = [
  { name: 'VendoorX Logo (SVG)', desc: 'Full colour, dark & light variants', size: 'SVG' },
  { name: 'VendoorX Logo (PNG)', desc: '512×512px, transparent background', size: '128 KB' },
  { name: 'Brand Guidelines', desc: 'Colour palette, typography, usage rules', size: 'PDF' },
  { name: 'Founder Photo', desc: 'Kenneth Okoronkwo, high-resolution', size: '2.4 MB' },
  { name: 'Product Screenshots', desc: 'Marketplace, dashboard, and store pages', size: 'ZIP' },
]

export default async function PressPage() {
  const settings = await getSiteSettings()
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
              VendoorX is Nigeria&apos;s #1 campus marketplace, connecting students across 120+ universities to buy and sell everything from electronics and textbooks to food and services — all powered by WhatsApp and Paystack. Founded in Lagos, VendoorX has processed over ₦2 billion in campus transactions since launch.
            </p>
          </div>

          {/* ── Founder section ── */}
          <div>
            <h2 className="text-xl font-black text-foreground mb-6">Founder &amp; Leadership</h2>
            <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl border border-border bg-card">
              {/* Avatar */}
              <div className="shrink-0 flex flex-col items-center sm:items-start gap-3">
                <div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #16a34a 0%, #0d9488 100%)' }}
                >
                  KO
                </div>
                <div className="flex flex-col gap-1">
                  <a
                    href="tel:+15792583013"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Phone className="w-3 h-3" /> +1 (579) 258-3013
                  </a>
                  <a
                    href="mailto:kenneth@vendoorx.com"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Mail className="w-3 h-3" /> kenneth@vendoorx.com
                  </a>
                </div>
              </div>

              {/* Bio */}
              <div className="flex-1 min-w-0">
                <div className="mb-1">
                  <h3 className="text-xl font-black text-foreground">Kenneth Okoronkwo</h3>
                  <p className="text-sm font-bold text-primary">Founder &amp; CEO</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                  Kenneth Okoronkwo is the founder and CEO of VendoorX, Nigeria&apos;s leading campus commerce platform. A serial entrepreneur and software engineer, Kenneth built VendoorX to solve the informal, unstructured nature of campus trade in Nigeria — where billions of naira in student transactions happen daily on WhatsApp, Instagram, and Facebook with no tracking, no security, and no trust infrastructure.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                  Under his leadership, VendoorX has grown to serve 50,000+ vendors across 120+ Nigerian universities, processing over ₦2 billion in verified transactions. Kenneth is passionate about building technology that empowers young African entrepreneurs at scale.
                </p>

                {/* Quote */}
                <div className="mt-5 pl-4 border-l-2 border-primary">
                  <Quote className="w-4 h-4 text-primary/50 mb-1" />
                  <p className="text-sm italic text-foreground leading-relaxed">
                    &ldquo;Every Nigerian campus has thousands of students with products to sell and zero tools to do it professionally. VendoorX changes that — one campus at a time.&rdquo;
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 font-semibold">— Kenneth Okoronkwo, Founder &amp; CEO</p>
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
              {/* iOS */}
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
              {/* Android */}
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
              {ASSETS.map(({ name, desc, size }) => (
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
                    <button className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
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
              For interview requests, press releases, product demos, or high-resolution photos, contact Kenneth directly or reach our communications team:
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <a href="mailto:press@vendoorx.com" className="text-sm font-semibold text-primary hover:underline">press@vendoorx.com</a>
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
