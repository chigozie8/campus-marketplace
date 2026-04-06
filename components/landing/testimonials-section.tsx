'use client'

import Image from 'next/image'
import { Star, BadgeCheck } from 'lucide-react'

const TESTIMONIALS = [
  {
    name: 'Adaeze Okonkwo',
    role: 'Fashion Seller',
    school: 'UNILAG',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop&q=80',
    initials: 'AO',
    color: 'from-pink-500 to-rose-600',
    rating: 5,
    revenue: '₦180,000',
    period: 'first month',
    quote: 'I made ₦180,000 in my first month selling clothes on VendoorX. The WhatsApp button is genius — buyers just chat me directly and we close the deal in minutes.',
    verified: true,
  },
  {
    name: 'Chukwuemeka Eze',
    role: 'Electronics Reseller',
    school: 'UI Ibadan',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80',
    initials: 'CE',
    color: 'from-blue-500 to-indigo-600',
    rating: 5,
    revenue: '3 Laptops',
    period: 'in one week',
    quote: 'Sold 3 laptops in one week just from listing them here. The platform is clean, fast, and the seller dashboard shows me exactly how many people viewed my listings.',
    verified: true,
  },
  {
    name: 'Fatimah Al-Hassan',
    role: 'Food Vendor',
    school: 'ABU Zaria',
    avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100&h=100&fit=crop&q=80',
    initials: 'FA',
    color: 'from-orange-500 to-red-600',
    rating: 5,
    revenue: 'Daily Orders',
    period: 'from campus',
    quote: 'My jollof rice business blew up after I listed on VendoorX. I get daily orders from students across campus now. Best business decision I ever made.',
    verified: true,
  },
  {
    name: 'Oluwafemi Adeyemi',
    role: 'Textbook Seller',
    school: 'OAU',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&q=80',
    initials: 'OA',
    color: 'from-emerald-500 to-green-600',
    rating: 5,
    revenue: 'School Fees',
    period: 'recouped',
    quote: 'Made back my school fees selling used textbooks! Students are always looking for affordable books and VendoorX puts me right in front of them.',
    verified: false,
  },
  {
    name: 'Blessing Nwosu',
    role: 'Beauty Entrepreneur',
    school: 'FUTA',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&q=80',
    initials: 'BN',
    color: 'from-rose-500 to-pink-600',
    rating: 5,
    revenue: '3x Sales',
    period: 'after badge',
    quote: 'The verified seller badge gives buyers confidence. My sales tripled once I got verified. VendoorX is the real deal for serious campus entrepreneurs.',
    verified: true,
  },
  {
    name: 'Ibrahim Musa',
    role: 'Tech Repair Service',
    school: 'BUK',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80',
    initials: 'IM',
    color: 'from-indigo-500 to-violet-600',
    rating: 5,
    revenue: 'Steady Clients',
    period: 'every week',
    quote: 'I offer laptop repairs and VendoorX sends me steady clients. The AI assistant even helped me write better service descriptions. Amazing platform!',
    verified: true,
  },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
  )
}

function AvatarPhoto({ src, initials, color, name }: { src: string; initials: string; color: string; name: string }) {
  return (
    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${color} overflow-hidden shadow-md shrink-0 ring-2 ring-white dark:ring-card`}>
      <Image
        src={src}
        alt={name}
        width={44}
        height={44}
        className="w-full h-full object-cover"
        onError={(e) => {
          const target = e.currentTarget as HTMLImageElement
          target.style.display = 'none'
          const parent = target.parentElement
          if (parent) {
            parent.innerHTML = `<span class="w-full h-full flex items-center justify-center text-white text-sm font-black">${initials}</span>`
          }
        }}
      />
    </div>
  )
}

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 sm:py-32 px-4 sm:px-6 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 text-primary text-xs font-black uppercase tracking-[0.2em] mb-5 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Real Stories
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground text-balance mt-4 mb-5 leading-tight">
            Campus entrepreneurs{' '}
            <span className="text-primary">love VendoorX</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Join thousands of students and young entrepreneurs already making real money on VendoorX.
          </p>
        </div>

        {/* Aggregate rating bar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-14 p-6 rounded-2xl bg-primary/5 border border-primary/15 max-w-2xl mx-auto">
          <div className="text-center sm:text-left">
            <p className="text-6xl font-black text-foreground leading-none">4.9</p>
            <Stars count={5} />
            <p className="text-xs text-muted-foreground mt-1">Average rating</p>
          </div>
          <div className="w-px h-12 bg-border hidden sm:block" />
          <div className="flex flex-col gap-1.5 flex-1 w-full sm:w-auto">
            {[5, 4, 3].map((star, i) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-3">{star}</span>
                <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all"
                    style={{ width: i === 0 ? '92%' : i === 1 ? '6%' : '2%' }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8">{i === 0 ? '92%' : i === 1 ? '6%' : '2%'}</span>
              </div>
            ))}
          </div>
          <div className="w-px h-12 bg-border hidden sm:block" />
          <div className="text-center sm:text-left shrink-0">
            <p className="text-3xl font-black text-foreground leading-none">50K+</p>
            <p className="text-xs text-muted-foreground mt-1">Active vendors</p>
            <p className="text-xs text-primary font-semibold mt-0.5">120+ campuses</p>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="group relative flex flex-col rounded-3xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/8 transition-all duration-500 hover:-translate-y-1.5"
            >
              {/* Top color strip */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${t.color}`} />

              <div className="flex flex-col gap-5 p-6 flex-1">
                {/* Metric highlight */}
                <div className="flex items-start justify-between">
                  <div className={`px-3 py-1.5 rounded-xl bg-gradient-to-br ${t.color}`}>
                    <p className="text-lg font-black text-white leading-none">{t.revenue}</p>
                    <p className="text-[10px] text-white/80 font-medium mt-0.5">{t.period}</p>
                  </div>
                  <Stars count={t.rating} />
                </div>

                {/* Quote */}
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 text-pretty">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <AvatarPhoto src={t.avatar} initials={t.initials} color={t.color} name={t.name} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-foreground truncate">{t.name}</p>
                      {t.verified && (
                        <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{t.role} · {t.school}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
