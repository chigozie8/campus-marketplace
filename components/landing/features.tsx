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
  ShoppingBag,
  Zap,
} from 'lucide-react'

const MAIN_FEATURES = [
  {
    icon: Bot,
    title: 'AI Customer Conversations',
    description: 'VendoorX AI replies to buyers on your behalf — answering product questions, handling enquiries, and guiding them to checkout 24/7.',
    tags: ['Auto-replies', '24/7 coverage', 'Zero missed leads'],
    highlight: true,
    span: 2,
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp-Powered Orders',
    description: 'Every product gets a smart link. Buyers tap once and land in your store — the AI walks them through checkout with zero friction.',
  },
  {
    icon: CreditCard,
    title: 'Payments via Chat',
    description: 'Accept secure card payments directly through WhatsApp — no bank app needed. Money lands instantly and you get an alert every time.',
  },
  {
    icon: LayoutDashboard,
    title: 'Your Seller Dashboard',
    description: 'Products, orders, earnings, and customers — all in one place. Know exactly what\'s selling and how your business is growing.',
  },
  {
    icon: Package,
    title: 'Automated Order Flow',
    description: 'Every order moves from pending to paid to delivered automatically. No lost chats, no missed orders — ever.',
  },
  {
    icon: TrendingUp,
    title: 'Sales Analytics',
    description: 'Revenue, best-sellers, and buyer behaviour — in real time. Use real data to sell smarter every week.',
  },
  {
    icon: Share2,
    title: 'Multi-Platform Sharing',
    description: 'Push your listings to WhatsApp Status, Instagram Stories, Facebook, and TikTok in one tap. Maximum reach, zero extra effort.',
    span: 2,
  },
  {
    icon: Users,
    title: 'Built-in Customer List',
    description: 'Every buyer is automatically saved with their name, number, and order history. Build loyalty — not just a scattered contacts list.',
  },
]

export function Features() {
  return (
    <LazyMotion features={domAnimation} strict>
      <section id="features" className="py-20 sm:py-24 bg-background scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <m.div
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <Zap className="w-3.5 h-3.5" />
              Built for You
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4 tracking-tight text-balance">
              Every tool your business needs to sell on WhatsApp
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-balance leading-relaxed">
              Stop duct-taping your business together with manual chats and spreadsheets. VendoorX gives you one powerful AI-driven platform to sell, automate, and grow.
            </p>
          </m.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MAIN_FEATURES.map((feature, i) => {
              const Icon = feature.icon
              const isHighlight = feature.highlight
              
              return (
                <m.div
                  key={feature.title}
                  className={`
                    relative overflow-hidden rounded-2xl border p-6 flex flex-col gap-4 group transition-all duration-300
                    ${isHighlight 
                      ? 'lg:col-span-2 border-primary/20 bg-primary/5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10' 
                      : feature.span === 2 
                        ? 'lg:col-span-2 border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5'
                        : 'border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5'
                    }
                  `}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  {/* Decorative glow for highlight card */}
                  {isHighlight && (
                    <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
                  )}
                  
                  {/* Icon */}
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 relative z-10
                    ${isHighlight ? 'bg-primary/15' : 'bg-muted'}
                  `}>
                    <Icon className={`w-6 h-6 ${isHighlight ? 'text-primary' : 'text-primary'}`} />
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="font-bold text-lg text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">{feature.description}</p>
                  </div>
                  
                  {/* Tags (for highlight card) */}
                  {feature.tags && (
                    <div className="flex flex-wrap gap-2 relative z-10">
                      {feature.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </m.div>
              )
            })}
          </div>
        </div>
      </section>
    </LazyMotion>
  )
}
