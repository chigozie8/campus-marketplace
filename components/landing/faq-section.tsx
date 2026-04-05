'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MessageCircle, Plus, Minus } from 'lucide-react'

const FAQS = [
  {
    category: 'Getting Started',
    q: 'Is VendoorX completely free to join?',
    a: 'Yes — joining VendoorX is 100% free. The Starter plan lets you list up to 10 products, generate WhatsApp order links, and receive buyers at zero cost, forever. We only charge if you choose to upgrade to a paid plan for advanced features.',
  },
  {
    category: 'Getting Started',
    q: 'Do I need a website to use VendoorX?',
    a: 'Not at all. VendoorX gives you a ready-made public store profile page you can share with anyone. No coding, no hosting, no setup — just sign up, add your products, and your store is live within minutes.',
  },
  {
    category: 'Payments',
    q: 'How do payments work on VendoorX?',
    a: 'On the free Starter plan, payments are handled directly between you and your buyer — cash on campus, bank transfer, etc. On Growth and Pro plans, you get Paystack integration so buyers can pay directly and you receive automatic payment confirmations.',
  },
  {
    category: 'Payments',
    q: 'Does VendoorX charge commission on my sales?',
    a: 'Never. VendoorX charges zero commission on any sale you make, regardless of your plan. The subscription fee is all you pay — keep every naira you earn.',
  },
  {
    category: 'Platform',
    q: 'What platforms does VendoorX work with?',
    a: 'VendoorX is built around WhatsApp, Instagram, and Facebook. You can share your listings and store directly to WhatsApp Status, Instagram Stories, and Facebook with a single tap.',
  },
  {
    category: 'Platform',
    q: 'How does the Verified Seller badge work?',
    a: 'The Verified Seller badge is available on the Pro plan. Our team reviews your profile, products, and history before granting verification. Verified sellers consistently convert more buyers because the badge signals trust and legitimacy.',
  },
  {
    category: 'Platform',
    q: 'Is VendoorX only for university students in Nigeria?',
    a: 'VendoorX is focused on Nigerian campuses and university students, but anyone can use the platform. We currently serve 120+ campuses across Nigeria including UNILAG, UI, OAU, FUTA, ABU, and BUK.',
  },
  {
    category: 'Billing',
    q: 'Can I cancel my subscription anytime?',
    a: 'Yes. You can upgrade, downgrade, or cancel your subscription at any time from your dashboard settings. When you cancel, you keep access until the end of your billing period, then you revert to the free Starter plan.',
  },
  {
    category: 'Platform',
    q: 'What is the AI listing assistant?',
    a: 'The AI listing assistant (available on the Pro plan) helps you write better product titles, descriptions, and pricing recommendations. It analyses successful listings in your category and suggests copy that attracts more buyers and converts faster.',
  },
  {
    category: 'Getting Started',
    q: 'How do I get started?',
    a: 'Click "Get Started Free" anywhere on this page. Sign up with your email or Google account, create your store profile, and add your first product. The whole setup takes under 5 minutes — no credit card needed.',
  },
]

const CATEGORY_COLORS: Record<string, string> = {
  'Getting Started': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Payments': 'bg-blue-50 text-blue-700 border-blue-200',
  'Platform': 'bg-violet-50 text-violet-700 border-violet-200',
  'Billing': 'bg-amber-50 text-amber-700 border-amber-200',
}

function FaqItem({ faq, index }: { faq: typeof FAQS[0]; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className={`group rounded-2xl border transition-all duration-300 overflow-hidden ${
        open
          ? 'border-primary/40 shadow-lg shadow-primary/8 bg-white'
          : 'border-border bg-card hover:border-primary/20 hover:shadow-md'
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-4 px-6 py-5 text-left"
        aria-expanded={open}
      >
        {/* Number */}
        <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-colors ${open ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[faq.category]}`}>
              {faq.category}
            </span>
          </div>
          <span className={`text-sm sm:text-base font-semibold leading-snug transition-colors ${open ? 'text-primary' : 'text-foreground'}`}>
            {faq.q}
          </span>
        </div>
        <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${open ? 'bg-primary text-white rotate-0' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}`}>
          {open ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </span>
      </button>

      <div className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="px-6 pb-6 pl-[4.25rem]">
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {faq.a}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function FaqSection() {
  return (
    <section id="faq" className="py-24 sm:py-32 px-4 sm:px-6 bg-[#fafafa]">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-1.5 text-primary text-xs font-black uppercase tracking-[0.2em] mb-5 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground text-balance mt-4 mb-5 leading-tight">
            Questions we{' '}
            <span className="relative inline-block">
              <span className="relative z-10 text-primary">always get asked</span>
              <span className="absolute -bottom-1 left-0 w-full h-2 bg-primary/15 rounded-full -z-0" />
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            Everything you need to know before you sign up. Still curious? We&apos;re always reachable.
          </p>
        </div>

        {/* FAQ items */}
        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => (
            <FaqItem key={i} faq={faq} index={i} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 rounded-3xl bg-primary/5 border border-primary/15 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-bold text-foreground text-base mb-1">Still have a question?</p>
            <p className="text-sm text-muted-foreground">Our team typically replies within 5 minutes on WhatsApp.</p>
          </div>
          <Link
            href="https://wa.me/2348000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#25D366] text-white text-sm font-bold hover:bg-[#20c05c] transition-all hover:scale-[1.03] shadow-lg shadow-[#25D366]/25 whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4" />
            Chat with us on WhatsApp
          </Link>
        </div>
      </div>
    </section>
  )
}
