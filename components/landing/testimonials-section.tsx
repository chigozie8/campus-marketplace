'use client'

import Image from 'next/image'
import { Star, BadgeCheck, Quote } from 'lucide-react'

const TESTIMONIALS = [
  {
    name: 'Adaeze Okonkwo',
    role: 'Fashion Seller',
    school: 'UNILAG',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=120&h=120&fit=crop&crop=faces&q=80',
    initials: 'AO',
    flag: '🇳🇬',
    metric: '₦180K',
    metricLabel: 'first month',
    rating: 5,
    quote: 'I made ₦180,000 in my first month selling clothes on VendoorX. The WhatsApp button is genius — buyers just chat me directly and we close the deal in minutes.',
    verified: true,
    accent: '#16a34a',
  },
  {
    name: 'Chukwuemeka Eze',
    role: 'Electronics Reseller',
    school: 'UI Ibadan',
    avatar: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=120&h=120&fit=crop&crop=faces&q=80',
    initials: 'CE',
    flag: '🇳🇬',
    metric: '3 Laptops',
    metricLabel: 'one week',
    rating: 5,
    quote: 'Sold 3 laptops in one week just from listing them here. The platform is clean, fast, and the seller dashboard shows me exactly how many people viewed my listings.',
    verified: true,
    accent: '#2563eb',
  },
  {
    name: 'Fatimah Al-Hassan',
    role: 'Food Vendor',
    school: 'ABU Zaria',
    avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=120&h=120&fit=crop&crop=faces&q=80',
    initials: 'FA',
    flag: '🇳🇬',
    metric: 'Daily Orders',
    metricLabel: 'campus-wide',
    rating: 5,
    quote: 'My jollof rice business blew up after I listed on VendoorX. I get daily orders from students across campus. Best business decision I ever made.',
    verified: true,
    accent: '#ea580c',
  },
  {
    name: 'Oluwafemi Adeyemi',
    role: 'Textbook Seller',
    school: 'OAU',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop&crop=faces&q=80',
    initials: 'OA',
    flag: '🇳🇬',
    metric: 'School Fees',
    metricLabel: 'recouped',
    rating: 5,
    quote: 'Made back my school fees selling used textbooks! Students are always looking for affordable books and VendoorX puts me right in front of them.',
    verified: false,
    accent: '#7c3aed',
  },
  {
    name: 'Blessing Nwosu',
    role: 'Beauty Entrepreneur',
    school: 'FUTA',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&crop=faces&q=80',
    initials: 'BN',
    flag: '🇳🇬',
    metric: '3× Sales',
    metricLabel: 'after badge',
    rating: 5,
    quote: 'The verified seller badge gives buyers confidence. My sales tripled once I got verified. VendoorX is the real deal for serious campus entrepreneurs.',
    verified: true,
    accent: '#db2777',
  },
  {
    name: 'Ibrahim Musa',
    role: 'Tech Repair Service',
    school: 'BUK',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&h=120&fit=crop&crop=faces&q=80',
    initials: 'IM',
    flag: '🇳🇬',
    metric: 'Steady Clients',
    metricLabel: 'every week',
    rating: 5,
    quote: 'I offer laptop repairs and VendoorX sends me steady clients every week. The AI assistant helped me write better service descriptions. Amazing platform!',
    verified: true,
    accent: '#0891b2',
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

function Avatar({ src, initials, name }: { src: string; initials: string; name: string }) {
  return (
    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 dark:bg-muted shrink-0 ring-2 ring-white dark:ring-border shadow-md">
      <Image
        src={src}
        alt={name}
        width={56}
        height={56}
        className="w-full h-full object-cover"
        onError={(e) => {
          const t = e.currentTarget as HTMLImageElement
          t.style.display = 'none'
          const p = t.parentElement
          if (p) p.innerHTML = `<span class="w-full h-full flex items-center justify-center text-white text-base font-black bg-[#16a34a]">${initials}</span>`
        }}
      />
    </div>
  )
}

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 sm:py-32 px-4 sm:px-6 overflow-hidden" style={{ background: 'linear-gradient(180deg,#f0fdf4 0%,#ffffff 40%)' }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#16a34a]/10 border border-[#16a34a]/20 text-[#16a34a] text-xs font-black uppercase tracking-[0.18em] mb-5">
            <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
            Real Students. Real Results.
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-950 dark:text-white text-balance leading-tight mb-4">
            Nigerian campuses are{' '}
            <span className="text-[#16a34a]">making money</span>
          </h2>
          <p className="text-gray-500 dark:text-muted-foreground text-lg max-w-xl mx-auto">
            From UNILAG to BUK — students across Nigeria are building real businesses on VendoorX.
          </p>
        </div>

        {/* Aggregate trust strip */}
        <div className="flex flex-wrap items-center justify-center gap-8 mb-16 py-6 px-6 rounded-3xl bg-white dark:bg-card border border-gray-100 dark:border-border shadow-sm max-w-3xl mx-auto">
          <div className="text-center">
            <p className="text-5xl font-black text-gray-950 dark:text-white leading-none">4.9</p>
            <Stars count={5} />
            <p className="text-xs text-gray-400 mt-1.5">Average rating</p>
          </div>
          <div className="w-px h-12 bg-gray-100 dark:bg-border hidden sm:block" />
          <div className="flex flex-col gap-2">
            {[
              { star: 5, pct: '92%', w: '92%' },
              { star: 4, pct: '6%',  w: '6%'  },
              { star: 3, pct: '2%',  w: '2%'  },
            ].map(({ star, pct, w }) => (
              <div key={star} className="flex items-center gap-2.5">
                <span className="text-xs text-gray-400 w-3">{star}</span>
                <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                <div className="w-28 h-2 rounded-full bg-gray-100 dark:bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-amber-400" style={{ width: w }} />
                </div>
                <span className="text-xs text-gray-400 w-6">{pct}</span>
              </div>
            ))}
          </div>
          <div className="w-px h-12 bg-gray-100 dark:bg-border hidden sm:block" />
          <div className="text-center">
            <p className="text-4xl font-black text-gray-950 dark:text-white leading-none">50K+</p>
            <p className="text-xs text-gray-400 mt-1.5">Active vendors</p>
            <p className="text-xs text-[#16a34a] font-bold mt-0.5">120+ campuses 🇳🇬</p>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="group relative bg-white dark:bg-card rounded-3xl border border-gray-100 dark:border-border shadow-sm hover:shadow-xl hover:shadow-black/8 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Top accent bar */}
              <div className="h-1 w-full" style={{ background: t.accent }} />

              <div className="p-6 flex flex-col gap-4 flex-1">
                {/* Metric + school */}
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="flex flex-col items-start px-3.5 py-2.5 rounded-2xl shrink-0"
                    style={{ background: `${t.accent}18` }}
                  >
                    <span className="text-xl font-black leading-none" style={{ color: t.accent }}>{t.metric}</span>
                    <span className="text-[10px] font-semibold mt-0.5" style={{ color: t.accent, opacity: 0.8 }}>{t.metricLabel}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-400 bg-gray-50 dark:bg-muted px-2.5 py-1.5 rounded-full shrink-0">
                    {t.flag} {t.school}
                  </span>
                </div>

                {/* Quote */}
                <div className="relative flex-1">
                  <Quote className="w-7 h-7 mb-2 opacity-20" style={{ color: t.accent }} />
                  <p className="text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed">
                    {t.quote}
                  </p>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-border">
                  <Avatar src={t.avatar} initials={t.initials} name={t.name} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-black text-gray-900 dark:text-white truncate">{t.name}</p>
                      {t.verified && (
                        <BadgeCheck className="w-4 h-4 shrink-0" style={{ color: t.accent }} />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{t.role}</p>
                    <Stars count={t.rating} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA strip */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-400 mb-2">Join over 50,000 students already hustling on VendoorX</p>
          <a
            href="/auth/sign-up"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#16a34a] text-white font-black text-sm hover:bg-[#15803d] transition-colors shadow-lg shadow-[#16a34a]/25"
          >
            Start Selling Free →
          </a>
        </div>

      </div>
    </section>
  )
}
