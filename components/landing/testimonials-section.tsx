'use client'

import React from 'react'
import { Star, Quote, Verified } from 'lucide-react'
import { useInView } from '@/hooks/use-in-view'

const TESTIMONIALS = [
  {
    name: 'Adaeze Okonkwo',
    role: 'Fashion Seller, UNILAG',
    avatar: 'AO',
    avatarColor: 'from-pink-500 to-rose-600',
    rating: 5,
    quote: 'I made ₦180,000 in my first month selling clothes on VendoorX. The WhatsApp button is genius — buyers just chat me directly and we close the deal in minutes.',
    verified: true,
  },
  {
    name: 'Chukwuemeka Eze',
    role: 'Electronics Reseller, UI Ibadan',
    avatar: 'CE',
    avatarColor: 'from-blue-500 to-indigo-600',
    rating: 5,
    quote: 'Sold 3 laptops in one week just from listing them here. The platform is clean, fast, and the seller dashboard shows me exactly how many people viewed my listings.',
    verified: true,
  },
  {
    name: 'Fatimah Al-Hassan',
    role: 'Food Vendor, ABU Zaria',
    avatar: 'FA',
    avatarColor: 'from-orange-500 to-red-600',
    rating: 5,
    quote: 'My jollof rice business blew up after I listed on VendoorX. I get daily orders from students across campus now. It\'s literally the best business decision I made.',
    verified: true,
  },
  {
    name: 'Oluwafemi Adeyemi',
    role: 'Textbook Seller, OAU',
    avatar: 'OA',
    avatarColor: 'from-emerald-500 to-green-600',
    rating: 5,
    quote: 'Made back my school fees selling used textbooks! Students are always looking for affordable books and VendoorX puts me right in front of them.',
    verified: false,
  },
  {
    name: 'Blessing Nwosu',
    role: 'Beauty Entrepreneur, FUTA',
    avatar: 'BN',
    avatarColor: 'from-rose-500 to-pink-600',
    rating: 5,
    quote: 'The verified seller badge gives buyers confidence. My sales tripled once I got verified. VendoorX is the real deal for serious campus entrepreneurs.',
    verified: true,
  },
  {
    name: 'Ibrahim Musa',
    role: 'Service Provider, BUK',
    avatar: 'IM',
    avatarColor: 'from-indigo-500 to-violet-600',
    rating: 5,
    quote: 'I offer laptop repairs and VendoorX has been sending me steady clients. The AI assistant even helped me write better service descriptions. Amazing platform!',
    verified: true,
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: rating }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
      ))}
    </div>
  )
}

function TestimonialCard({ t }: { t: typeof TESTIMONIALS[number] }) {
  return (
    <div className="group relative flex flex-col gap-5 rounded-3xl border border-border bg-card/80 backdrop-blur-sm p-7 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 w-[340px] flex-shrink-0">
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${t.avatarColor} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`} />
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
        <Quote className="w-5 h-5 text-primary" />
      </div>
      <p className="text-base text-muted-foreground leading-relaxed flex-1 text-pretty relative z-10">
        &ldquo;{t.quote}&rdquo;
      </p>
      <div className="flex items-center justify-between pt-5 border-t border-border relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.avatarColor} flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
            {t.avatar}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-foreground">{t.name}</p>
              {t.verified && <Verified className="w-4 h-4 text-primary fill-primary/20" />}
            </div>
            <p className="text-xs text-muted-foreground">{t.role}</p>
          </div>
        </div>
        <StarRating rating={t.rating} />
      </div>
    </div>
  )
}

export function TestimonialsSection() {
  const { ref, isInView } = useInView()
  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="py-24 sm:py-32 bg-background overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div
          className={`text-center mb-16 px-4 ${isInView ? 'animate-fade-up' : 'opacity-0'}`}
          style={{ animationDelay: '0ms' }}
        >
          <span className="inline-block text-primary text-sm font-semibold uppercase tracking-widest mb-4 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground text-balance mt-4 mb-5">
            Loved by <span className="text-primary">campus entrepreneurs</span>
          </h2>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto text-pretty leading-relaxed">
            Join thousands of students and young entrepreneurs already making money on VendoorX.
          </p>
        </div>

        {/* CSS marquee — duplicated list scrolls infinitely, pauses on hover */}
        <div
          className={`overflow-hidden ${isInView ? 'animate-fade-in' : 'opacity-0'}`}
          style={{ animationDelay: '300ms' }}
        >
          <div className="flex gap-6 animate-marquee w-max px-6">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <TestimonialCard key={`${t.name}-${i}`} t={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
