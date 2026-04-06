import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Download, Mail, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Press Kit | VendoorX',
  description: 'Download VendoorX brand assets, logos, and media kit for press coverage.',
}

const STATS = [
  { value: '50,000+', label: 'Active Vendors' },
  { value: '120+', label: 'Nigerian Campuses' },
  { value: '₦2B+', label: 'Transactions Processed' },
  { value: '4.9/5', label: 'Average Rating' },
]

const ASSETS = [
  { name: 'VendoorX Logo (SVG)', desc: 'Full colour, dark & light variants', size: 'SVG' },
  { name: 'VendoorX Logo (PNG)', desc: '512×512px, transparent background', size: '128 KB' },
  { name: 'Brand Guidelines', desc: 'Colour palette, typography, usage rules', size: 'PDF' },
  { name: 'Founder Photo', desc: 'High-resolution press photo', size: '2.4 MB' },
  { name: 'Product Screenshots', desc: 'Marketplace, dashboard, and store pages', size: 'ZIP' },
]

export default function PressPage() {
  return (
    <div className="bg-background">
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 via-background to-background dark:from-gray-900/30 border-b border-border">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border text-muted-foreground text-xs font-bold uppercase tracking-widest mb-6">
            <FileText className="w-3.5 h-3.5" />
            Media
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-4">Press Kit</h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
            Writing about VendoorX? We&apos;ve got everything you need — brand assets, key statistics, company background, and media contact details.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto flex flex-col gap-12">

          {/* Company snapshot */}
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

          {/* Brand assets */}
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

          {/* Media contact */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
            <h2 className="text-lg font-black text-foreground mb-2">Media Enquiries</h2>
            <p className="text-sm text-muted-foreground mb-5">
              For interview requests, press releases, product demos, or high-resolution photos, contact our communications team:
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <a href="mailto:press@vendoorx.com" className="text-sm font-semibold text-primary hover:underline">press@vendoorx.com</a>
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
