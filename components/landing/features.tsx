'use client'

import { m, LazyMotion, domAnimation } from 'framer-motion'
import {
  MessageCircle,
  LayoutDashboard,
  CreditCard,
  Package,
  Share2,
  TrendingUp,
  Users,
  Bot,
} from 'lucide-react'

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
}

export function Features() {
  return (
    <LazyMotion features={domAnimation} strict>
    <section id="features" className="py-24 bg-background scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <m.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center gap-1.5 text-primary text-xs font-black uppercase tracking-[0.18em] mb-4 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            Built for You
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-balance mb-4 tracking-tight">
            Every tool your business needs to sell on WhatsApp
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-balance leading-relaxed">
            Stop duct-taping your business together with manual chats and spreadsheets. VendoorX gives you one powerful AI-driven platform to sell, automate, and grow.
          </p>
        </m.div>

        {/* Bento grid — hero card top-left, secondary cards fill the rest */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Hero card — AI Conversations: spans 2 cols on lg */}
          <m.div
            className="lg:col-span-2 relative overflow-hidden rounded-3xl border border-primary/20 bg-primary/5 dark:bg-primary/10 p-8 flex flex-col gap-4 group hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
            custom={0}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
            <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 relative z-10">
              <Bot className="w-7 h-7 text-primary" />
            </div>
            <div className="relative z-10">
              <h3 className="font-black text-xl text-foreground mb-2">AI Customer Conversations</h3>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base max-w-lg">
                VendoorX AI replies to buyers on your behalf — answering product questions, handling enquiries, and guiding them to checkout 24/7. No more being glued to your phone.
              </p>
            </div>
            {/* Decorative pill row */}
            <div className="flex flex-wrap gap-2 mt-2 relative z-10">
              {['Auto-replies', '24/7 coverage', 'Zero missed leads'].map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">{tag}</span>
              ))}
            </div>
          </m.div>

          {/* WhatsApp Orders */}
          <m.div className="rounded-3xl border border-border bg-card p-6 flex flex-col gap-3 group hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300" custom={1} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
            <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/30 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <MessageCircle className="w-5 h-5 text-teal-600" />
            </div>
            <h3 className="font-bold text-foreground">WhatsApp-Powered Orders</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Every product gets a smart link. Buyers tap once and land in your store — the AI walks them through checkout with zero friction.</p>
          </m.div>

          {/* Payments */}
          <m.div className="rounded-3xl border border-border bg-card p-6 flex flex-col gap-3 group hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300" custom={2} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <CreditCard className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="font-bold text-foreground">Payments via Chat</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Accept secure card payments directly through WhatsApp — no bank app needed. Money lands instantly and you get an alert every time.</p>
          </m.div>

          {/* Dashboard */}
          <m.div className="rounded-3xl border border-border bg-card p-6 flex flex-col gap-3 group hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300" custom={3} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <LayoutDashboard className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-foreground">Your Seller Dashboard</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Products, orders, earnings, and customers — all in one place. Know exactly what&apos;s selling and how your business is growing.</p>
          </m.div>

          {/* Order Flow */}
          <m.div className="rounded-3xl border border-border bg-card p-6 flex flex-col gap-3 group hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300" custom={4} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-bold text-foreground">Automated Order Flow</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Every order moves from pending to paid to delivered automatically. No lost chats, no missed orders — ever.</p>
          </m.div>

          {/* Analytics */}
          <m.div className="rounded-3xl border border-border bg-card p-6 flex flex-col gap-3 group hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300" custom={5} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
            <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-bold text-foreground">Sales Analytics</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Revenue, best-sellers, and buyer behaviour — in real time. Use real data to sell smarter every week.</p>
          </m.div>

          {/* Sharing — spans 2 cols on lg */}
          <m.div className="lg:col-span-2 rounded-3xl border border-border bg-card p-6 flex flex-col sm:flex-row gap-5 group hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300" custom={6} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
            <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
              <Share2 className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-1.5">Multi-Platform Sharing</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Push your listings to WhatsApp Status, Instagram Stories, Facebook, and TikTok in one tap. Maximum reach across every channel your buyers are on — zero extra effort.</p>
            </div>
          </m.div>

          {/* Customer List */}
          <m.div className="rounded-3xl border border-border bg-card p-6 flex flex-col gap-3 group hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300" custom={7} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-bold text-foreground">Built-in Customer List</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Every buyer is automatically saved with their name, number, and order history. Build loyalty — not just a scattered contacts list.</p>
          </m.div>

        </div>
      </div>
    </section>
    </LazyMotion>
  )
}
