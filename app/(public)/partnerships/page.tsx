import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Handshake, Building2, Zap, Megaphone, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Partnerships | VendoorX',
  description: 'Partner with VendoorX to grow your reach across Nigeria\'s AI-powered WhatsApp commerce platform. Explore brand, technology, and affiliate partnership opportunities.',
}

const TYPES = [
  {
    icon: Zap,
    title: 'Business & Brand Partnerships',
    desc: 'Reach Nigeria\'s most active buyers and sellers on WhatsApp. Partner with VendoorX to place your brand at the centre of conversational commerce — through sponsored listings, category features, and co-branded campaigns.',
    cta: 'Explore brand partnerships',
    color: 'text-green-600',
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-900/40',
  },
  {
    icon: Building2,
    title: 'Reseller & Agency Partnerships',
    desc: 'Are you a digital agency, growth consultant, or business enabler in Nigeria? Resell VendoorX to your clients, earn recurring commissions, and help businesses automate their sales on WhatsApp.',
    cta: 'Become a reseller',
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-900/40',
  },
  {
    icon: Megaphone,
    title: 'Affiliate & Creator Partnerships',
    desc: 'Are you an influencer, content creator, or community leader? Join our affiliate programme, earn referral bonuses for every seller you bring on board, and get exclusive creator perks.',
    cta: 'Become an affiliate',
    color: 'text-rose-600',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    border: 'border-rose-200 dark:border-rose-900/40',
  },
  {
    icon: ShieldCheck,
    title: 'Technology Integrations',
    desc: 'Want to integrate your payment, logistics, fintech, or AI product with VendoorX? We offer open APIs and a partnership programme for complementary tech companies building in the African commerce space.',
    cta: 'Explore integration',
    color: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-200 dark:border-purple-900/40',
  },
]

export default function PartnershipsPage() {
  return (
    <div className="bg-background">
      <section className="py-20 px-4 bg-gradient-to-br from-teal-50 via-background to-background dark:from-teal-950/20 border-b border-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/40 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Handshake className="w-3.5 h-3.5" />
            Partnerships
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-5 leading-tight">
            Grow with VendoorX&apos;s{' '}
            <span className="text-primary">commerce network.</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
            We&apos;re building a network of partners — brands, agencies, creators, and tech companies — who believe in the power of AI-driven commerce across messaging channels in Nigeria and beyond.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          {TYPES.map(({ icon: Icon, title, desc, cta, color, bg, border }) => (
            <div key={title} className={`rounded-2xl border-2 ${border} ${bg} p-6 flex gap-5 items-start`}>
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-card flex items-center justify-center shrink-0 shadow-sm">
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-black text-foreground mb-2">{title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{desc}</p>
                <Link
                  href={`/contact?subject=${encodeURIComponent(title)}`}
                  className={`inline-flex items-center gap-1.5 text-sm font-bold ${color} hover:underline`}
                >
                  {cta} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto mt-14 text-center">
          <h2 className="text-2xl font-black text-foreground mb-3">Ready to partner with us?</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">Tell us about your organisation and what you have in mind. Our partnerships team responds within 2 business days.</p>
          <Link
            href="/contact?subject=Partnership Enquiry"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-base transition-all hover:scale-[1.02] shadow-xl shadow-primary/25"
          >
            Get in Touch <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
