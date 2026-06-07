import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import {
  ArrowRight, Code2, Layers, Cpu, Globe,
  Award, Building2, Mail, Quote, ShieldCheck,
} from 'lucide-react'
import { buildMetadata, SITE_URL } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Founder | VendoorX — Nigeria\'s Campus Marketplace',
  description:
    'VendoorX was founded by a senior software engineer based in Nigeria. Learn about the vision, engineering, and story behind Africa\'s fastest-growing campus marketplace.',
  path: '/founder',
  keywords: [
    // Name-based — for ranking when "Kenneth Okoronkwo" is searched
    'Kenneth Okoronkwo',
    'Kenneth Okoronkwo founder',
    'Kenneth Okoronkwo VendoorX',
    'Kenneth Okoronkwo software engineer',
    'Kenneth Okoronkwo Nigeria',
    'Kenneth Okoronkwo Nigerian tech',
    'Kenneth Okoronkwo campus marketplace',
    'Kenneth Okoronkwo entrepreneur',
    'Kenneth Okoronkwo CEO',
    'Kenneth Okoronkwo developer',
    'Kenneth Okoronkwo engineer',
    // Platform / topical
    'VendoorX founder',
    'VendoorX CEO',
    'VendoorX engineering',
    'VendoorX story',
    'Nigerian software engineer founder',
    'Nigerian tech founder',
    'African campus marketplace founder',
    'senior software engineer Nigeria',
    'Nigeria campus commerce',
    'WhatsApp commerce Nigeria founder',
  ],
})

const TIMELINE = [
  {
    year: '2022',
    heading: 'The Idea',
    body: 'Frustrated by the chaos of buying and selling on campus group chats, our founder — a senior software engineer — set out to build something better: a structured, verifiable marketplace built for Nigerian students.',
  },
  {
    year: '2023',
    heading: 'First Product',
    body: 'The first version of VendoorX launched on two campuses, integrating WhatsApp-native ordering with Paystack payments. Within 90 days, 500+ vendors had created stores.',
  },
  {
    year: '2024',
    heading: 'Scale',
    body: 'Platform expanded to 120+ Nigerian universities. Engineering infrastructure was rebuilt from scratch for performance and reliability — handling hundreds of concurrent transactions daily.',
  },
  {
    year: '2025',
    heading: 'Today',
    body: 'VendoorX serves 50,000+ active vendors across Nigeria, processing over ₦2 billion in verified transactions. The full engineering stack — from real-time chat to wallet infrastructure — was built by the founding engineer.',
  },
]

const PILLARS = [
  {
    icon: Code2,
    title: 'Built by an Engineer',
    body: 'Every line of the VendoorX stack was written by a senior software engineer. No outsourcing, no agency — just deep technical ownership from day one.',
  },
  {
    icon: Layers,
    title: 'Full-Stack Architecture',
    body: 'From database schema to mobile app shell, the platform spans Next.js 16, Supabase, Paystack, WhatsApp API, push notifications, and Capacitor-based iOS/Android apps.',
  },
  {
    icon: Cpu,
    title: 'Product & Engineering, Unified',
    body: 'The founder runs both product and engineering simultaneously — meaning every feature ships with technical precision and a clear user problem to solve.',
  },
  {
    icon: Globe,
    title: 'Rooted in African Tech',
    body: 'Built and operated from Nigeria, VendoorX is proof that world-class commerce infrastructure can be built in Africa, for Africa.',
  },
]

// JSON-LD: Person schema — name appears here for search engines, not in rendered UI
const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${SITE_URL}/founder#kenneth-okoronkwo`,
  name: 'Kenneth Okoronkwo',
  jobTitle: 'Founder, CEO & Senior Software Engineer',
  description:
    'Kenneth Okoronkwo is the founder, CEO, and senior software engineer of VendoorX — Nigeria\'s #1 campus marketplace. He architected and built the full platform stack from the ground up, combining expertise in full-stack engineering, product design, and African digital commerce.',
  url: `${SITE_URL}/founder`,
  sameAs: [`${SITE_URL}/press`],
  worksFor: {
    '@type': 'Organization',
    '@id': `${SITE_URL}#organization`,
    name: 'VendoorX',
    url: SITE_URL,
  },
  knowsAbout: [
    'Full-Stack Software Engineering',
    'Next.js',
    'TypeScript',
    'React',
    'Supabase',
    'PostgreSQL',
    'WhatsApp Commerce',
    'Mobile App Development',
    'Product Architecture',
    'E-commerce Platforms',
    'Nigerian Tech Ecosystem',
    'Campus Marketplaces',
    'Paystack Integration',
    'Capacitor',
    'African Digital Commerce',
  ],
  nationality: 'Nigerian',
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}#organization`,
  name: 'VendoorX',
  url: SITE_URL,
  founder: { '@id': `${SITE_URL}/founder#kenneth-okoronkwo` },
  foundingDate: '2022',
  foundingLocation: { '@type': 'Place', name: 'Lagos, Nigeria' },
  description:
    "Nigeria's #1 campus marketplace — connecting 50,000+ student vendors across 120+ universities via WhatsApp commerce.",
  areaServed: 'Nigeria',
}

export default function FounderPage() {
  return (
    <div className="bg-background min-h-screen">

      {/* Structured data */}
      <Script
        id="founder-person-jsonld"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <Script
        id="founder-org-jsonld"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 py-12 sm:py-20 lg:py-28">

          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-widest mb-7 sm:mb-8">
            <Building2 className="w-3 h-3" />
            The Founder
          </span>

          <h1 className="text-2xl sm:text-5xl lg:text-7xl font-black text-foreground leading-snug sm:leading-tight tracking-tight sm:tracking-tighter mb-5 sm:mb-6 text-balance max-w-3xl">
            VendoorX was built by a{' '}
            <span className="text-primary">Nigerian builder</span>{' '}
            who ships.
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xl mb-8 sm:mb-10">
            Not a business school project. Not a VC-funded concept. VendoorX is a working product, architected and shipped end-to-end by one engineer who saw a real problem on Nigerian campuses and built the solution.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm transition-all shadow-lg shadow-primary/20"
            >
              Browse the Marketplace <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/press"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-border hover:border-primary/60 text-foreground font-semibold text-sm transition-all"
            >
              Press &amp; Media
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {[
              { value: '50K+', label: 'Active Vendors' },
              { value: '120+', label: 'Universities' },
              { value: '₦2B+', label: 'Transactions' },
              { value: '1',    label: 'Founding Engineer' },
            ].map(({ value, label }, i) => (
              <div
                key={label}
                className={`flex flex-col items-center justify-center gap-1 py-8 sm:py-10 px-4 text-center border-border
                  ${i % 2 === 0 ? 'border-r' : ''}
                  ${i < 2 ? 'border-b lg:border-b-0' : ''}
                  ${i === 1 ? 'lg:border-r' : ''}
                  ${i === 2 ? 'lg:border-r' : ''}
                `}
              >
                <p className="text-3xl sm:text-5xl font-black text-primary leading-none">{value}</p>
                <p className="text-xs sm:text-sm font-bold text-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-5 sm:px-6 py-10 sm:py-16 flex flex-col gap-12 sm:gap-20">

        {/* ── FOUNDER QUOTE ── */}
        <section className="rounded-3xl border border-border bg-card p-6 sm:p-10 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-3xl" />
          <div className="pl-4 sm:pl-5">
            <Quote className="w-7 h-7 text-primary/20 mb-4" />
            <blockquote className="text-base sm:text-2xl lg:text-3xl font-black text-foreground leading-snug sm:leading-tight italic mb-4 sm:mb-5 text-balance">
              &ldquo;Every Nigerian campus has thousands of students with products to sell and zero tools to do it professionally. VendoorX changes that — one campus at a time.&rdquo;
            </blockquote>
            <p className="text-primary text-xs sm:text-sm font-bold">
              — Founder &amp; CEO, VendoorX
            </p>
          </div>
        </section>

        {/* ── ENGINEERING PILLARS ── */}
        <section>
          <div className="mb-7 sm:mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2.5">Engineering Philosophy</p>
            <h2 className="text-2xl sm:text-4xl font-black text-foreground leading-snug sm:leading-tight text-balance">
              How VendoorX was built
            </h2>
            <p className="text-muted-foreground text-sm mt-3 max-w-xl leading-relaxed">
              The platform was designed, architected, and shipped by a single senior software engineer with a bias for fast iteration, zero technical debt on core paths, and a deep understanding of the Nigerian student market.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PILLARS.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── WHAT WE STAND FOR ── */}
        <section>
          <div className="mb-7">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2.5">Values</p>
            <h2 className="text-2xl sm:text-4xl font-black text-foreground leading-snug sm:leading-tight">
              What we stand for
            </h2>
            <p className="text-muted-foreground text-sm mt-3 max-w-xl leading-relaxed">
              VendoorX was built on a handful of convictions that still drive every decision we make.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                number: '01',
                title: 'Campus students deserve real tools',
                body: 'Selling through group chats is chaotic and unprofessional. Every student vendor deserves a proper storefront, payment flow, and order management — not just a pinned post.',
              },
              {
                number: '02',
                title: 'Africa does not need to wait for Silicon Valley',
                body: 'World-class commerce infrastructure can be built in Nigeria, for Nigeria. We do not need permission or foreign investment to ship something excellent.',
              },
              {
                number: '03',
                title: 'Simplicity beats feature bloat',
                body: 'Every feature on VendoorX exists because a real vendor needed it. We cut anything that adds complexity without adding genuine value to the student on the other end.',
              },
              {
                number: '04',
                title: 'Trust is the product',
                body: 'Escrow payments, verified vendors, dispute resolution — none of this is optional. On a platform where buyer and seller often never meet in person, trust is the entire product.',
              },
            ].map(({ number, title, body }) => (
              <div
                key={number}
                className="flex flex-col gap-3 p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all"
              >
                <span className="text-3xl font-black text-primary/20 leading-none">{number}</span>
                <div>
                  <h3 className="text-base font-black text-foreground mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── TIMELINE ── */}
        <section>
          <div className="mb-7 sm:mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2.5">Story</p>
            <h2 className="text-2xl sm:text-4xl font-black text-foreground leading-snug sm:leading-tight">
              From idea to platform
            </h2>
          </div>

          <div className="flex flex-col gap-6">
              {TIMELINE.map(({ year, heading, body }) => (
                <div key={year} className="flex gap-4 sm:gap-6">
                  {/* Year badge */}
                  <div className="shrink-0 flex flex-col items-center gap-1.5 pt-0.5">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-md shadow-primary/30">
                      <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-black text-primary">{year}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 border-l border-border pl-4 sm:pl-6 pb-2">
                    <h3 className="text-sm sm:text-base font-black text-foreground mb-1">{heading}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
        </section>

        {/* ── QUICK FACTS ── */}
        <section>
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2.5">Company</p>
            <h2 className="text-2xl sm:text-4xl font-black text-foreground leading-snug sm:leading-tight">Quick facts</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: Building2,   label: 'Founded',  value: '2022, Lagos Nigeria' },
              { icon: Globe,       label: 'Model',    value: 'WhatsApp Commerce SaaS' },
              { icon: ShieldCheck, label: 'Stage',    value: 'Growth — Series A Ready' },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-black text-foreground leading-tight">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="rounded-3xl border border-primary/20 bg-primary/5 p-6 sm:p-10 flex flex-col gap-5">
          <div>
            <h2 className="text-xl sm:text-3xl font-black text-foreground leading-snug sm:leading-tight mb-2">
              Want to reach the founder?
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              For press, partnerships, engineering collaborations, or investor enquiries — reach out directly.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="mailto:press@vendoorx.ng"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm transition-all shadow-lg shadow-primary/20"
            >
              <Mail className="w-4 h-4" />
              press@vendoorx.ng
            </a>
            <Link
              href="/contact?subject=Founder+Enquiry"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-border hover:border-primary/60 text-foreground/80 hover:text-foreground font-semibold text-sm transition-all"
            >
              Send an enquiry <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
