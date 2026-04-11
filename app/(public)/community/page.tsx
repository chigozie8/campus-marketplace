import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Users, MessageCircle, Star, Zap, Trophy } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Community | VendoorX',
  description: 'Join the VendoorX community of 50,000+ seller and entrepreneurs. Connect, learn, and grow together.',
}

const CHANNELS = [
  {
    icon: MessageCircle,
    title: 'WhatsApp Community',
    desc: 'Join our WhatsApp community groups — organised by category and location. Get tips, ask questions, and find buyers.',
    cta: 'Join WhatsApp Community',
    href: 'https://wa.me/2348000000000',
    color: '#25D366',
    textColor: 'text-white',
  },
  {
    icon: Users,
    title: 'Telegram Group',
    desc: 'Our Telegram channel broadcasts exclusive deals, platform updates, and seller success stories to 10,000+ members.',
    cta: 'Join Telegram',
    href: 'https://t.me/vendoorx',
    color: '#2AABEE',
    textColor: 'text-white',
  },
]

const ACHIEVEMENTS = [
  { icon: Trophy, label: 'Top Seller', desc: 'Monthly award for highest-rated sellers', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  { icon: Star, label: 'Rising Star', desc: 'For sellers who 10x their sales in 30 days', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30' },
  { icon: Zap, label: 'Speed Dealer', desc: 'Awarded for 24-hour order turnaround', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  { icon: Users, label: 'Community Hero', desc: 'For members who help others in the community', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
]

export default function CommunityPage() {
  return (
    <div className="bg-background">
      <section className="py-20 px-4 bg-gradient-to-br from-green-50 via-background to-background dark:from-green-950/20 border-b border-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
            <Users className="w-3.5 h-3.5" />
            Community
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-5 leading-tight">
            50,000 sellers.<br />
            <span className="text-primary">One community.</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
            The VendoorX community is where Nigeria&apos;s best seller and entrepreneurs share tips, celebrate wins, support each other, and close deals together.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto flex flex-col gap-14">

          {/* Join channels */}
          <div>
            <h2 className="text-xl font-black text-foreground mb-6">Join the Conversation</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {CHANNELS.map(({ icon: Icon, title, desc, cta, href, color }) => (
                <a
                  key={title}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-2xl border-2 border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all overflow-hidden"
                >
                  <div className="h-16 flex items-center px-6 gap-3" style={{ background: color }}>
                    <Icon className="w-6 h-6 text-white" />
                    <p className="text-white font-black text-base">{title}</p>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{desc}</p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-primary group-hover:gap-2.5 transition-all">
                      {cta} <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Community achievements */}
          <div>
            <h2 className="text-xl font-black text-foreground mb-6">Community Recognition</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ACHIEVEMENTS.map(({ icon: Icon, label, desc, color, bg }) => (
                <div key={label} className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card hover:border-primary/20 transition-all">
                  <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center rounded-2xl border border-primary/20 bg-primary/5 py-12 px-6">
            <h2 className="text-2xl font-black text-foreground mb-3">Start your journey today</h2>
            <p className="text-muted-foreground text-sm mb-8 leading-relaxed max-w-md mx-auto">
              Join VendoorX free, build your store, and connect with a community that celebrates your hustle.
            </p>
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-base transition-all hover:scale-[1.02] shadow-xl shadow-primary/25"
            >
              Join VendoorX <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>
    </div>
  )
}
