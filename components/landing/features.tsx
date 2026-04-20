'use client'

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
import { Reveal } from '@/components/ui/reveal'

const features = [
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
    icon: LayoutDashboard,
    title: 'Your Seller Dashboard',
    description:
      'See everything in one place — your products, orders, earnings, and customers. Know what\'s selling, what needs attention, and how your business is growing in real time.',
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
  },
  {
    icon: Package,
    title: 'Automated Order Flow',
    description:
      'Every order moves from pending → paid → delivered in a clean automated system. No more losing track of who ordered what. Buyers always know exactly where their item stands.',
    color: 'text-primary',
    bg: 'bg-primary/8 dark:bg-primary/10',
  },
  {
    icon: CreditCard,
    title: 'Payments via Chat',
    description:
      'Accept secure card payments directly through WhatsApp — no bank app needed. Money lands in your account instantly and you get an alert every single time.',
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
  },
  {
    icon: TrendingUp,
    title: 'Sales Analytics',
    description:
      'See your revenue, best-selling products, and buyer behaviour — all in real time. Use real data to make smarter decisions and sell more every week.',
    color: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
  },
  {
    icon: Share2,
    title: 'Multi-Platform Sharing',
    description:
      'Push your listings to WhatsApp Status, Instagram Stories, Facebook, and TikTok in one tap. Reach buyers on every channel they already use — with zero extra effort.',
    color: 'text-rose-600',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
  },
  {
    icon: Users,
    title: 'Built-in Customer List',
    description:
      'Every buyer is automatically saved with their name, number, and full order history. Build a loyal customer base — not just a scattered contacts list you\'ll forget.',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Built for You</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-balance mb-4">
            Every tool your business needs to sell on WhatsApp
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-balance leading-relaxed">
            Stop duct-taping your business together with manual chats and spreadsheets. VendoorX gives you one powerful AI-driven platform to sell, automate, and grow.
          </p>
        </Reveal>

        <Reveal stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon: Icon, title, description, color, bg }) => (
            <div
              key={title}
              className="p-6 rounded-2xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
            >
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
