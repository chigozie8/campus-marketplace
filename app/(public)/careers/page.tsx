import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Briefcase, Heart, Zap, Users, Globe, Coffee, MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Careers | VendoorX',
  description: 'Join the VendoorX team and help build Africa\'s most loved campus marketplace. See open positions.',
}

const PERKS = [
  { icon: Heart, title: 'Health First', desc: 'HMO health insurance for you and one dependent. Your health is non-negotiable.' },
  { icon: Zap, title: 'Fast Growth', desc: 'Join a rocket ship. Your work impacts 50,000+ users from day one.' },
  { icon: Globe, title: 'Remote Friendly', desc: 'Work from anywhere in Nigeria. We trust you to manage your own time and output.' },
  { icon: Coffee, title: 'Learning Budget', desc: '₦120,000/year for courses, books, conferences, and anything that makes you better.' },
  { icon: Users, title: 'Equity Options', desc: 'Early hires get meaningful equity. We grow together.' },
  { icon: MapPin, title: 'Lagos Hub', desc: 'Optional in-person office in Victoria Island for those who prefer it.' },
]

const ROLES = [
  {
    title: 'Senior Full-Stack Engineer',
    team: 'Engineering',
    type: 'Full-time · Remote',
    desc: 'Own critical features end-to-end. Next.js 16, Supabase, TypeScript, Paystack APIs. You ship fast and break nothing.',
  },
  {
    title: 'Product Designer (UI/UX)',
    team: 'Design',
    type: 'Full-time · Remote',
    desc: 'Design the marketplace, onboarding, and seller tools for 50,000+ users. You love Figma and hate unnecessary friction.',
  },
  {
    title: 'Growth & Community Manager',
    team: 'Growth',
    type: 'Full-time · Lagos',
    desc: 'Own our campus ambassador programme. Build communities at universities across Nigeria and drive seller acquisition.',
  },
  {
    title: 'Customer Success Specialist',
    team: 'Operations',
    type: 'Full-time · Lagos',
    desc: 'Be the first point of contact for sellers and buyers. Resolve disputes, answer questions, and make people happy.',
  },
]

export default function CareersPage() {
  return (
    <div className="bg-background">

      {/* Hero */}
      <section className="py-20 sm:py-28 px-4 bg-gradient-to-br from-indigo-50 via-background to-background dark:from-indigo-950/20 border-b border-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Briefcase className="w-3.5 h-3.5" />
            We&apos;re Hiring
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-5 leading-tight">
            Build the future of<br />
            <span className="text-primary">African campus commerce.</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            We&apos;re a small, ambitious team solving a real problem for millions of Nigerian students. If you love shipping products that matter, you belong here.
          </p>
        </div>
      </section>

      {/* Perks */}
      <section className="py-16 sm:py-20 px-4 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-8 text-center">Why VendoorX</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PERKS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3 hover:border-primary/30 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-1">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open roles */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Open Positions</p>
            <span className="text-xs font-semibold text-muted-foreground bg-muted px-3 py-1 rounded-full">{ROLES.length} roles open</span>
          </div>
          <div className="flex flex-col gap-4">
            {ROLES.map(({ title, team, type, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-border bg-card p-6 flex flex-col sm:flex-row sm:items-start gap-4 hover:border-primary/30 hover:shadow-lg transition-all group"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors">{title}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <span className="px-2 py-0.5 rounded-full bg-muted font-medium">{team}</span>
                    <span>·</span>
                    <span>{type}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
                <Link
                  href={`/contact?subject=Job Application — ${encodeURIComponent(title)}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold text-sm transition-all shrink-0 whitespace-nowrap"
                >
                  Apply <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center rounded-2xl border border-dashed border-border py-10 px-6">
            <p className="text-foreground font-bold mb-2">Don&apos;t see your role?</p>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">We&apos;re always looking for exceptional talent. Send your CV and tell us how you&apos;d make VendoorX better.</p>
            <Link
              href="/contact?subject=General Application"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm transition-all"
            >
              Send Open Application <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
