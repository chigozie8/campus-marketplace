import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Bot,
  MessageCircle,
  LayoutDashboard,
  Package,
  CreditCard,
  TrendingUp,
  Share2,
  Users,
  Shield,
  Zap,
  Star,
  Rocket,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { buildMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = buildMetadata({
  title: 'Features',
  description:
    'Everything you get with VendoorX — AI customer chat, escrow payments, automated orders, multi-channel sharing, real-time analytics and more. Built for Nigerian sellers.',
  path: '/features',
  keywords: [
    'vendoorx features',
    'whatsapp commerce features',
    'nigerian marketplace features',
    'escrow payments nigeria',
    'ai customer chat',
  ],
})

const CORE_FEATURES = [
  {
    icon: Bot,
    title: 'AI Customer Conversations',
    description:
      'VendoorX AI replies to buyers on your behalf — answering product questions, handling enquiries, and guiding them to checkout 24/7. No more being glued to your phone.',
    color: 'text-green-600',
    bg: 'bg-green-50 dark:bg-green-950/30',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp-Powered Orders',
    description:
      'Every product gets a smart link that opens a pre-filled WhatsApp chat. Buyers tap once, land in your store, and the AI walks them through their order — no friction, no middlemen.',
    color: 'text-teal-600',
    bg: 'bg-teal-50 dark:bg-teal-950/30',
  },
  {
    icon: Shield,
    title: 'Escrow Protection',
    description:
      'Buyer money is held safely until the item is confirmed delivered. If anything goes wrong, our dispute team steps in — protecting both sides on every single order.',
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
  },
  {
    icon: LayoutDashboard,
    title: 'Your Seller Dashboard',
    description:
      'See everything in one place — products, orders, earnings, and customers. Know what\'s selling, what needs attention, and how your business is growing in real time.',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
  },
  {
    icon: Package,
    title: 'Automated Order Flow',
    description:
      'Every order moves from pending → paid → shipped → delivered automatically. No more losing track of who ordered what. Buyers always know exactly where their item stands.',
    color: 'text-primary',
    bg: 'bg-primary/8 dark:bg-primary/10',
  },
  {
    icon: CreditCard,
    title: 'Payments via Chat',
    description:
      'Accept secure card and bank payments directly through WhatsApp — no bank app needed. Money lands in your account fast and you get an alert every single time.',
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
  },
  {
    icon: TrendingUp,
    title: 'Sales Analytics',
    description:
      'Revenue, best-sellers, and buyer behaviour — all in real time. Use real data to make smarter decisions and sell more every week.',
    color: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
  },
  {
    icon: Share2,
    title: 'Multi-Platform Sharing',
    description:
      'Push your listings to WhatsApp Status, Instagram, Facebook and TikTok in one tap. Reach buyers on every channel they already use — with zero extra effort.',
    color: 'text-rose-600',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
  },
  {
    icon: Users,
    title: 'Built-in Customer List',
    description:
      'Every buyer is automatically saved with their name, number, and full order history. Build a loyal customer base — not just a scattered contacts list you\'ll forget.',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50 dark:bg-cyan-950/30',
  },
]

const HIGHLIGHTS = [
  {
    icon: Zap,
    title: 'Built for Nigerian networks',
    desc: 'Loads on 2G, works on old phones, survives power cuts. Speed is non-negotiable.',
  },
  {
    icon: Shield,
    title: 'Verified sellers only',
    desc: 'Every seller is verified before they can list — buyers shop with confidence.',
  },
  {
    icon: Sparkles,
    title: 'Zero hidden fees',
    desc: 'One simple, transparent platform fee. No surprises at checkout.',
  },
  {
    icon: Rocket,
    title: 'Launch in minutes',
    desc: 'Sign up, list your first product, and start receiving orders the same day.',
  },
]

const COMPARE = [
  { feature: 'AI replies to buyers 24/7', vx: true, others: false },
  { feature: 'Escrow payment protection', vx: true, others: false },
  { feature: 'WhatsApp-native checkout', vx: true, others: false },
  { feature: 'Automated order tracking', vx: true, others: 'Manual' },
  { feature: 'Multi-platform sharing', vx: true, others: false },
  { feature: 'Real-time analytics', vx: true, others: 'Limited' },
  { feature: 'Built for Nigerian networks', vx: true, others: false },
  { feature: 'Verified-seller marketplace', vx: true, others: false },
]

export default function FeaturesPage() {
  return (
    <main className="bg-background">
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="absolute -top-32 -right-20 -z-10 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 -z-10 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-3xl" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-28 sm:pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Star className="w-3.5 h-3.5 text-primary fill-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">All Features</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-balance mb-5">
            Everything you need to <span className="text-primary">sell smarter</span> on WhatsApp
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance mb-8">
            VendoorX is your AI-powered storefront, customer chat, payment gateway, and dispute team — bundled into one
            simple platform built for Nigerian sellers.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
            >
              Start selling free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-border bg-card text-foreground font-bold text-sm hover:bg-accent transition-all"
            >
              Browse marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* ── Highlights strip ───────────────────────────────────────────────── */}
      <section className="border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center sm:text-left">
                <div className="inline-flex w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Core Features grid ─────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">Core Features</p>
            <h2 className="text-3xl sm:text-4xl font-black text-balance mb-4">
              Every tool your business needs in one place
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed text-balance">
              Stop duct-taping your business together with manual chats and spreadsheets. VendoorX is your
              all-in-one storefront, AI assistant, and payment gateway.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CORE_FEATURES.map(({ icon: Icon, title, description, color, bg }) => (
              <div
                key={title}
                className="p-6 rounded-2xl border border-border/60 bg-card hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="font-bold text-foreground mb-2 text-base">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison ─────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-muted/30 border-y border-border/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">VendoorX vs The Rest</p>
            <h2 className="text-2xl sm:text-3xl font-black text-balance mb-3">
              Why sellers are switching to VendoorX
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
              See how we stack up against the usual scattered tools and informal marketplaces.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="grid grid-cols-3 px-5 py-4 border-b border-border bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <div>Feature</div>
              <div className="text-center text-primary">VendoorX</div>
              <div className="text-center">Other Platforms</div>
            </div>
            {COMPARE.map(({ feature, vx, others }, i) => (
              <div
                key={feature}
                className={`grid grid-cols-3 px-5 py-4 items-center text-sm ${
                  i !== COMPARE.length - 1 ? 'border-b border-border/60' : ''
                }`}
              >
                <div className="font-medium text-foreground">{feature}</div>
                <div className="text-center">
                  {vx === true ? (
                    <CheckCircle2 className="w-5 h-5 text-primary inline" />
                  ) : (
                    <span className="text-muted-foreground text-xs">{vx}</span>
                  )}
                </div>
                <div className="text-center">
                  {others === true ? (
                    <CheckCircle2 className="w-5 h-5 text-primary inline" />
                  ) : others === false ? (
                    <span className="text-muted-foreground/60 text-lg">—</span>
                  ) : (
                    <span className="text-muted-foreground text-xs">{others}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-10 sm:p-14 text-center text-primary-foreground shadow-2xl shadow-primary/20">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" aria-hidden />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" aria-hidden />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-3 text-balance">
                Ready to grow your business?
              </h2>
              <p className="text-base sm:text-lg opacity-90 max-w-xl mx-auto mb-7 text-balance">
                Join thousands of Nigerian sellers using VendoorX to sell faster, smarter, and safer on WhatsApp.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/auth/sign-up"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white text-primary font-bold text-sm shadow-lg hover:bg-white/95 transition-all"
                >
                  Create your free store
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/10 border border-white/30 text-white font-bold text-sm hover:bg-white/20 transition-all backdrop-blur"
                >
                  See pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
