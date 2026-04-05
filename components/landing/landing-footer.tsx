'use client'

import Link from 'next/link'
import { ArrowRight, MessageCircle, Instagram, Facebook, Twitter, MapPin } from 'lucide-react'

const LINKS = {
  Product: [
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Sell on VendoorX', href: '/auth/sign-up' },
    { label: 'AI Assistant', href: '/assistant' },
    { label: 'Seller Dashboard', href: '/dashboard' },
  ],
  Company: [
    { label: 'About Us', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Press Kit', href: '#' },
  ],
  Support: [
    { label: 'Help Center', href: '#' },
    { label: 'Contact Us', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
}

const STATS = [
  { value: '50K+', label: 'Active Students' },
  { value: '120+', label: 'Campuses' },
  { value: '₦2B+', label: 'Transactions' },
  { value: '4.9★', label: 'App Rating' },
]

// Custom VendoorX logo SVG — a stylised V-tag icon
function VendoorXIcon({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Tag body */}
      <path
        d="M6 6h18a2 2 0 0 1 1.42.59l8 8a2 2 0 0 1 0 2.82l-12 12a2 2 0 0 1-2.82 0l-12-12A2 2 0 0 1 6 16V6z"
        fill="#16a34a"
      />
      {/* V letterform */}
      <path
        d="M13 13l3.5 8L20 13M16.5 21l3.5-8"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dot on tag (hole) */}
      <circle cx="26.5" cy="13.5" r="1.6" fill="white" opacity="0.85" />
    </svg>
  )
}

export function LandingFooter() {
  return (
    <footer className="relative bg-[#0a0f0d] text-white overflow-hidden">

      {/* Giant watermark wordmark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
      >
        <span
          className="text-[clamp(5rem,18vw,14rem)] font-black tracking-tighter leading-none whitespace-nowrap"
          style={{ color: 'rgba(255,255,255,0.025)' }}
        >
          VendoorX
        </span>
      </div>

      {/* Green glow top-left */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(22,163,74,0.18) 0%, transparent 70%)' }}
      />
      {/* Green glow bottom-right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(22,163,74,0.12) 0%, transparent 70%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Stats strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px border-b border-white/10">
          {STATS.map((s) => (
            <div key={s.label} className="py-8 px-6 flex flex-col gap-1">
              <span className="text-3xl font-black text-[#22c55e] tracking-tight">{s.value}</span>
              <span className="text-xs text-white/40 uppercase tracking-widest font-medium">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Main content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 py-16">

          {/* Brand column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <VendoorXIcon size={40} />
              <span className="text-2xl font-black tracking-tight text-white">
                Vendoor<span className="text-[#22c55e]">X</span>
              </span>
            </Link>

            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              Nigeria&apos;s #1 campus marketplace. Buy, sell, and close deals directly on WhatsApp — zero fees, zero friction.
            </p>

            {/* Location */}
            <div className="flex items-center gap-2 text-xs text-white/30">
              <MapPin className="w-3.5 h-3.5 text-[#22c55e]" />
              <span>Made in Nigeria, built for campus life</span>
            </div>

            {/* Social icons */}
            <div className="flex gap-3">
              {[
                { href: 'https://wa.me/', icon: MessageCircle, label: 'WhatsApp', bg: '#25D366' },
                { href: 'https://instagram.com/', icon: Instagram, label: 'Instagram', bg: '#E1306C' },
                { href: 'https://facebook.com/', icon: Facebook, label: 'Facebook', bg: '#1877F2' },
                { href: 'https://twitter.com/', icon: Twitter, label: 'Twitter', bg: '#1DA1F2' },
              ].map(({ href, icon: Icon, label, bg }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:brightness-110"
                  style={{ backgroundColor: bg }}
                >
                  <Icon className="w-4 h-4 text-white" />
                </a>
              ))}
            </div>

            {/* Newsletter */}
            <div className="mt-2">
              <p className="text-xs text-white/40 uppercase tracking-widest font-medium mb-3">Campus deals in your inbox</p>
              <form
                className="flex gap-2"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 min-w-0 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#22c55e]/60 focus:bg-white/8 transition-colors"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] transition-colors flex items-center gap-1.5 text-sm font-semibold text-white shrink-0"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-10">
            {Object.entries(LINKS).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-xs text-white/30 uppercase tracking-widest font-semibold mb-5">{category}</h4>
                <ul className="flex flex-col gap-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/55 hover:text-[#22c55e] transition-colors hover:translate-x-0.5 inline-block"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-white/8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/25">
            &copy; {new Date().getFullYear()} VendoorX Technologies Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-white/25">
            <span className="inline-block w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
            <span>All systems operational</span>
          </div>
          <p className="text-xs text-white/25">
            Built with love for Nigerian campus entrepreneurs
          </p>
        </div>
      </div>
    </footer>
  )
}
