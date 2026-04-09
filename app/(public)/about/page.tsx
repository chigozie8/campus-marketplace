import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Target, Heart, Zap, Shield, Users, Globe, TrendingUp, CheckCircle2 } from 'lucide-react'
import { getSiteSettings } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'About VendoorX — Nigeria\'s #1 Campus Marketplace',
  description: 'Learn about VendoorX, our mission to connect Nigerian campus communities, and the team building Africa\'s most loved student marketplace.',
}

const VALUES = [
  {
    icon: Heart,
    title: 'Student-First',
    desc: 'Every decision starts with the question: does this make life better for Nigerian students? We build for the campus, not the boardroom.',
    color: 'text-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
  },
  {
    icon: Shield,
    title: 'Trust & Safety',
    desc: 'Verified sellers, escrow payments, and a dispute team ready to resolve issues — because your money and goods deserve protection.',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
  },
  {
    icon: Zap,
    title: 'Speed Over Everything',
    desc: 'Slow apps kill deals. VendoorX is built for 2G networks, old phones, and the hustle that never sleeps between lectures.',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
  },
  {
    icon: Globe,
    title: 'Built for Nigeria',
    desc: 'Not a copy-paste of a Western app. Every feature — Paystack checkout, WhatsApp orders, Naira wallets — is Nigerian-native.',
    color: 'text-green-600',
    bg: 'bg-green-50 dark:bg-green-950/30',
  },
]

const MILESTONES = [
  { year: '2022', event: 'VendoorX idea born at UNILAG hostel, frustrated by scattered WhatsApp sales' },
  { year: '2023', event: 'Beta launched at 3 universities — 500 sellers in 30 days' },
  { year: '2024', event: 'Paystack integration, wallets, and boosted listings go live' },
  { year: '2025', event: '50,000 active vendors, 120+ campuses, ₦2B+ in transactions processed' },
  { year: '2026', event: 'Expanding to West Africa — Ghana, Kenya, and beyond 🌍' },
]

const STAT_ICONS = [Users, Globe, TrendingUp, Target]

export default async function AboutPage() {
  const settings = await getSiteSettings()

  const STATS = [
    { value: settings.stat_active_vendors, label: 'Active Vendors',    icon: Users },
    { value: settings.stat_campuses,        label: 'Campuses',           icon: Globe },
    { value: settings.stat_transactions,    label: 'Transactions',       icon: TrendingUp },
    { value: settings.stat_rating,          label: 'Avg Rating',         icon: Target },
  ]

  return (
    <div className="bg-background">

      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-32 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-background to-background dark:from-green-950/20 dark:via-background dark:to-background pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-8">
            <Target className="w-3.5 h-3.5" />
            Our Story
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground leading-tight mb-6">
            We&apos;re building the{' '}
            <span className="text-primary">economic backbone</span>{' '}
            of Nigerian campuses.
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
            VendoorX started as a frustrated student&apos;s late-night idea and grew into Nigeria&apos;s most trusted campus marketplace — connecting buyers and sellers across 120+ universities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-base transition-all hover:scale-[1.02] shadow-xl shadow-primary/25"
            >
              Join VendoorX <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-border hover:border-primary/40 text-foreground font-semibold text-base transition-all hover:bg-muted/50"
            >
              Browse Marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 border-y border-border bg-muted/30">
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-1">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <p className="text-3xl sm:text-4xl font-black text-foreground">{value}</p>
              <p className="text-sm text-muted-foreground font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 sm:py-28 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Our Mission</p>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-6 leading-tight">
              Every Nigerian student deserves a{' '}
              <span className="text-primary">powerful platform</span>{' '}
              to sell what they have.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The hustle is real. Nigerian students sell everything — jollof rice, secondhand textbooks, refurbished phones, handmade jewelry, graphic design services — and they&apos;ve been doing it through scattered WhatsApp groups and Facebook posts for years.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              VendoorX gives every student entrepreneur a professional storefront, payment tools, and real buyers — all in one place, completely free to join.
            </p>
            <ul className="flex flex-col gap-3">
              {['Zero commission, ever', 'WhatsApp-powered deals', 'Paystack-secured payments', 'Seller verification system'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm font-medium text-foreground">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl blur-2xl" />
            <div className="relative rounded-3xl border-2 border-primary/20 bg-card p-8 flex flex-col gap-6">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Timeline</p>
              {MILESTONES.map((m, i) => (
                <div key={m.year} className="flex gap-4 items-start">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                      <span className="text-xs font-black text-primary">{m.year}</span>
                    </div>
                    {i < MILESTONES.length - 1 && <div className="w-px h-6 bg-border mt-2" />}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed pt-2">{m.event}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 sm:py-28 px-4 bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">What We Stand For</p>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUES.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-6 flex gap-4 hover:shadow-lg hover:border-primary/20 transition-all">
                <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-5">
            Ready to be part of<br />
            <span className="text-primary">the movement?</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
            Join {settings.stat_active_vendors} students already building their campus businesses on VendoorX. It takes 2 minutes and costs absolutely nothing.
          </p>
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg transition-all hover:scale-[1.02] shadow-2xl shadow-primary/25"
          >
            Join VendoorX for Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

    </div>
  )
}
