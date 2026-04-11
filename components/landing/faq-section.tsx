'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MessageCircle, Plus, Minus } from 'lucide-react'

const FAQS = [
  {
    category: 'Getting Started',
    q: 'Is VendoorX completely free to join?',
    a: 'Yes — joining VendoorX is 100% free, forever. The Starter plan lets you list up to 10 products, get a public store page, and connect buyers directly via WhatsApp at zero cost. We only charge when you choose to unlock advanced features on a paid plan.',
  },
  {
    category: 'Getting Started',
    q: 'Do I need a website or any technical skills?',
    a: 'Not at all. VendoorX gives you a ready-made store page you can share with anyone, instantly. No coding, no hosting, no setup headache — just sign up, add your products, and your store is live within 2 minutes.',
  },
  {
    category: 'Getting Started',
    q: 'Who is VendoorX for?',
    a: 'VendoorX is for any seller or business that wants to automate their sales and customer conversations on WhatsApp. Whether you\'re a solo entrepreneur, a small business, a growing brand, or anyone selling products or services in Nigeria — VendoorX gives you the AI tools to sell, support customers, and collect payments, all through chat.',
  },
  {
    category: 'Payments',
    q: 'How do payments work on VendoorX?',
    a: 'On the free plan, you settle payments directly with your buyer however you like — cash, bank transfer, etc. On Growth and Pro plans, buyers can pay you online with their card right from your store page or through WhatsApp, and you get an instant alert the moment money lands. Simple.',
  },
  {
    category: 'Payments',
    q: 'Does VendoorX take a cut of my sales?',
    a: 'Never. VendoorX takes zero commission on any sale you make — regardless of your plan. The only thing you pay is your subscription fee (if you choose a paid plan). Every naira you earn goes straight to you.',
  },
  {
    category: 'Platform',
    q: 'How does the AI handle my customer conversations?',
    a: 'VendoorX AI automatically replies to buyers on your behalf on WhatsApp — answering product questions, confirming orders, and guiding customers through checkout 24/7. You can customise its tone and responses from your dashboard. It\'s like having a sales assistant that never sleeps.',
  },
  {
    category: 'Platform',
    q: 'Which platforms can I share my listings to?',
    a: 'You can share your listings to WhatsApp Status, Instagram Stories, Facebook, TikTok, and more — in a single tap. VendoorX generates the perfect post for each platform so you don\'t have to think about it.',
  },
  {
    category: 'Platform',
    q: 'How does the Verified Seller badge work?',
    a: 'The Verified Seller badge is available on the Pro plan. Our team reviews your profile and products before granting verification. Once verified, a trust badge appears on your store and listings — giving buyers confidence to choose you over unverified sellers. Verified sellers consistently close more deals.',
  },
  {
    category: 'Billing',
    q: 'Can I cancel my subscription anytime?',
    a: 'Yes, completely. You can upgrade, downgrade, or cancel from your dashboard settings at any time. When you cancel, you keep all your features until the end of the billing period, then you move back to the free Starter plan — no surprises.',
  },
  {
    category: 'Platform',
    q: 'What is the AI listing assistant?',
    a: 'The AI listing assistant (Pro plan only) helps you write better product titles, descriptions, and even suggests the right price for your items. It looks at what\'s working in your category and gives you copy that attracts more buyers and converts faster. Think of it as a personal copywriter for your store.',
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
          ? 'border-primary/40 shadow-lg shadow-primary/8 bg-white dark:bg-card'
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
    <section id="faq" className="py-24 sm:py-32 px-4 sm:px-6 bg-[#fafafa] dark:bg-muted/20">
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
              <span className="relative z-10 text-primary">get asked all the time</span>
              <span className="absolute -bottom-1 left-0 w-full h-2 bg-primary/15 rounded-full -z-0" />
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            Everything you need to know before signing up. Still not sure? We&apos;re always reachable on WhatsApp.
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
            <p className="text-sm text-muted-foreground">Our team typically responds within 5 minutes on WhatsApp.</p>
          </div>
          <a
            href="https://wa.me/15792583013?text=Hi%20VendoorX%2C%20I%20have%20a%20question..."
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#25D366] text-white text-sm font-bold hover:bg-[#20c05c] transition-all hover:scale-[1.03] shadow-lg shadow-[#25D366]/25 whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4" />
            Chat with us on WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
