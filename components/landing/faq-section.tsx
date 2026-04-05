'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'

const FAQS = [
  {
    q: 'Is VendoorX completely free to join?',
    a: 'Yes — joining VendoorX is 100% free. The Starter plan lets you list up to 10 products, generate WhatsApp order links, and receive buyers at zero cost, forever. We only charge if you choose to upgrade to a paid plan for advanced features.',
  },
  {
    q: 'Do I need a website to use VendoorX?',
    a: 'Not at all. VendoorX gives you a ready-made public store profile page you can share with anyone. No coding, no hosting, no setup — just sign up, add your products, and your store is live within minutes.',
  },
  {
    q: 'How do payments work on VendoorX?',
    a: 'On the free Starter plan, payments are handled directly between you and your buyer — cash on campus, bank transfer, etc. On Growth and Pro plans, you get Paystack integration so buyers can pay directly and you receive automatic payment confirmations.',
  },
  {
    q: 'Does VendoorX charge commission on my sales?',
    a: 'Never. VendoorX charges zero commission on any sale you make, regardless of your plan. The subscription fee is all you pay — keep every naira you earn.',
  },
  {
    q: 'What platforms does VendoorX work with?',
    a: 'VendoorX is built around WhatsApp, Instagram, and Facebook. You can share your listings and store directly to WhatsApp Status, Instagram Stories, and Facebook with a single tap. We also integrate with Paystack and Flutterwave for payments.',
  },
  {
    q: 'How does the Verified Seller badge work?',
    a: 'The Verified Seller badge is available on the Pro plan. Our team reviews your profile, products, and history before granting verification. Verified sellers consistently convert more buyers because the badge signals trust and legitimacy.',
  },
  {
    q: 'Is VendoorX only for university students in Nigeria?',
    a: 'VendoorX is focused on Nigerian campuses and university students, but anyone can use the platform. We currently serve 120+ campuses across Nigeria including UNILAG, UI, OAU, FUTA, ABU, and BUK.',
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Yes. You can upgrade, downgrade, or cancel your subscription at any time from your dashboard settings. When you cancel, you keep access until the end of your billing period, then you revert to the free Starter plan.',
  },
  {
    q: 'What is the AI listing assistant?',
    a: 'The AI listing assistant (available on the Pro plan) helps you write better product titles, descriptions, and pricing recommendations. It analyses successful listings in your category and suggests copy that attracts more buyers and converts faster.',
  },
  {
    q: 'How do I get started?',
    a: 'Click "Get Started Free" anywhere on this page. Sign up with your email or Google account, create your store profile, and add your first product. The whole setup takes under 5 minutes — no credit card needed.',
  },
]

export function FaqSection() {
  return (
    <section id="faq" className="py-24 sm:py-32 px-4 sm:px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-primary text-sm font-semibold uppercase tracking-widest mb-4 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground text-balance mt-4 mb-5">
            Questions we{' '}
            <span className="text-primary">always get asked</span>
          </h2>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-xl mx-auto leading-relaxed text-pretty">
            Everything you need to know before you sign up. Still curious? We&apos;re always reachable.
          </p>
        </div>

        {/* Accordion */}
        <div className="rounded-3xl border border-border bg-card overflow-hidden divide-y divide-border">
          <Accordion type="multiple" className="w-full">
            {FAQS.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-0 px-6 sm:px-8"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground text-left hover:no-underline py-5 gap-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-sm sm:text-base pb-6">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center flex flex-col items-center gap-4">
          <p className="text-muted-foreground text-base">
            Still have a question? Our team is happy to help.
          </p>
          <Link
            href="https://wa.me/2348000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#25D366] text-white text-sm font-bold hover:bg-[#20c05c] transition-all hover:scale-[1.03] shadow-lg shadow-[#25D366]/25"
          >
            <MessageCircle className="w-4 h-4" />
            Chat with us on WhatsApp
          </Link>
        </div>
      </div>
    </section>
  )
}
