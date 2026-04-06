import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Search, ShoppingBag, CreditCard, Shield, Package, Star, MessageCircle, ChevronDown } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Help Center | VendoorX',
  description: 'Get help with buying, selling, payments, account issues, and more on VendoorX campus marketplace.',
}

const CATEGORIES = [
  {
    icon: ShoppingBag,
    title: 'Buying & Browsing',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-900/40',
    questions: [
      { q: 'How do I find products on VendoorX?', a: 'Use the search bar at the top of the marketplace page. You can filter by category, price range, university, and condition. The "Nearest" filter shows listings closest to your campus.' },
      { q: 'How do I contact a seller?', a: 'Click the "Chat on WhatsApp" button on any listing. This opens WhatsApp with a pre-filled message to the seller. You can also make an offer directly on the listing page.' },
      { q: 'Is it safe to buy on VendoorX?', a: 'Yes! All sellers are verified with university email addresses. For checkout payments, funds are held in escrow and only released when you confirm delivery. Always check seller ratings before buying.' },
      { q: 'What if a product is not as described?', a: 'You have 48 hours after delivery to raise a dispute. Go to your order, click "Report a Problem," and our team will mediate. If the dispute is valid, you receive a full refund.' },
    ],
  },
  {
    icon: Package,
    title: 'Selling & Listings',
    color: 'text-green-600',
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-900/40',
    questions: [
      { q: 'How do I post a listing?', a: 'Click "Sell" in the navigation. Fill in your product name, description, price, category, and up to 5 photos or videos. Your listing goes live instantly after submission.' },
      { q: 'Is it free to list products?', a: 'Yes — listing is 100% free forever. VendoorX only charges a flat ₦100 platform fee when a buyer completes a Paystack checkout (not on WhatsApp deals).' },
      { q: 'How do I boost my listing?', a: 'From your dashboard, click "Boost" next to any listing. Pay ₦500–₦2,000 via Paystack for 7 days of priority placement. Boosted listings show a "Featured" badge.' },
      { q: 'Can I sell food or services?', a: 'Absolutely! VendoorX supports all legal products and services — food, fashion, electronics, textbooks, tutoring, graphic design, photography, and more.' },
    ],
  },
  {
    icon: CreditCard,
    title: 'Payments & Wallets',
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-200 dark:border-purple-900/40',
    questions: [
      { q: 'How does checkout payment work?', a: 'When a buyer pays via Paystack, the money goes into escrow. After delivery is confirmed (or 48 hours with no dispute), funds are released to the seller\'s wallet minus the ₦100 platform fee.' },
      { q: 'How do I withdraw my wallet balance?', a: 'Go to Dashboard → Payouts. Connect your bank account, then click "Withdraw." Transfers are processed instantly via Paystack. Minimum withdrawal is ₦500.' },
      { q: 'What payment methods are accepted?', a: 'Paystack supports debit cards, bank transfers, USSD, and mobile money. For WhatsApp deals, payment is arranged directly between buyer and seller.' },
      { q: 'Is my payment information secure?', a: 'All payments are processed by Paystack, a PCI-DSS certified payment provider. VendoorX never stores your card details.' },
    ],
  },
  {
    icon: Shield,
    title: 'Account & Security',
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    border: 'border-orange-200 dark:border-orange-900/40',
    questions: [
      { q: 'How do I get verified as a seller?', a: 'Sign up with your .edu.ng university email address. Your account is automatically flagged as a university student. Complete your profile with a clear photo to boost trust with buyers.' },
      { q: 'I forgot my password. What do I do?', a: 'Click "Sign in" then "Forgot password." Enter your email and we\'ll send a password reset link. Check your spam folder if you don\'t see it within 2 minutes.' },
      { q: 'How do I report a fraudulent seller?', a: 'Click "Report" on any listing or seller profile. Fill in the reason and evidence. Our trust & safety team reviews reports within 24 hours and bans confirmed bad actors.' },
      { q: 'Can I delete my account?', a: 'Yes. Go to Settings → Account → Delete Account. Note: any active listings will be removed and pending wallet balance will be paid out first.' },
    ],
  },
]

const POPULAR = [
  { q: 'Is VendoorX completely free?', a: 'Joining is free. Listing is free. WhatsApp deals are free. A small ₦100 platform fee applies only to Paystack checkout orders.' },
  { q: 'How long does delivery take?', a: 'Delivery times vary by seller and location. Most campus sellers deliver within 1–3 hours for on-campus orders. Check the listing for delivery details.' },
  { q: 'Can I sell across different universities?', a: 'Yes! Your listings are visible to all users across Nigeria. You set your own delivery range and can ship nationwide.' },
]

export default function HelpPage() {
  return (
    <div className="bg-background">

      {/* Header */}
      <section className="relative bg-gradient-to-br from-green-50 via-background to-background dark:from-green-950/20 dark:via-background dark:to-background py-20 px-4 overflow-hidden border-b border-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
            <MessageCircle className="w-3.5 h-3.5" />
            Help Center
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-4">How can we help?</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Find answers to common questions about buying, selling, payments, and your account.
          </p>
          {/* Search (decorative) */}
          <div className="flex items-center gap-3 max-w-xl mx-auto px-4 py-3.5 rounded-2xl bg-card border-2 border-border focus-within:border-primary transition-colors shadow-sm">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search for help..."
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
            />
          </div>
        </div>
      </section>

      {/* Popular questions */}
      <section className="py-14 px-4 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-6">Most Asked</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {POPULAR.map(({ q, a }) => (
              <div key={q} className="rounded-2xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-md transition-all">
                <p className="text-sm font-bold text-foreground mb-2 leading-snug">{q}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto flex flex-col gap-10">
          {CATEGORIES.map(({ icon: Icon, title, color, bg, border, questions }) => (
            <div key={title} className={`rounded-3xl border-2 ${border} overflow-hidden`}>
              {/* Category header */}
              <div className={`${bg} px-6 py-5 flex items-center gap-3 border-b ${border}`}>
                <div className={`w-10 h-10 rounded-xl bg-white dark:bg-card flex items-center justify-center shadow-sm`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h2 className="text-lg font-black text-foreground">{title}</h2>
              </div>
              {/* Questions */}
              <div className="divide-y divide-border">
                {questions.map(({ q, a }) => (
                  <details key={q} className="group px-6 py-5 cursor-pointer">
                    <summary className="flex items-start justify-between gap-4 list-none">
                      <span className="text-sm font-semibold text-foreground group-open:text-primary transition-colors leading-snug">{q}</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 group-open:rotate-180 transition-transform" />
                    </summary>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{a}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 px-4 bg-muted/40 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <Star className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-black text-foreground mb-3">Still need help?</h2>
          <p className="text-muted-foreground mb-8">Our support team is online Monday–Saturday, 8am–10pm. We typically respond within 2 hours.</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-base transition-all hover:scale-[1.02] shadow-lg shadow-primary/25"
          >
            Contact Support <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  )
}
