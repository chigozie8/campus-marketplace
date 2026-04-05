'use client'

import Link from 'next/link'
import { ArrowRight, MessageCircle, Instagram, Facebook, Twitter, MapPin, Zap } from 'lucide-react'

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

function VendoorXIcon({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer circle */}
      <circle cx="22" cy="22" r="21" fill="#16a34a" />
      {/* Inner white ring accent */}
      <circle cx="22" cy="22" r="16" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      {/* Bold V letterform */}
      <path
        d="M13 14l6 14h6l6-14"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* X accent dot — bottom right */}
      <circle cx="33" cy="33" r="4" fill="white" />
      <path
        d="M31 31l4 4M35 31l-4 4"
        stroke="#16a34a"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function LandingFooter() {
  return (
    <footer className="bg-white border-t border-gray-100 overflow-hidden">

      {/* ── Top green accent bar ── */}
      <div className="h-1 w-full bg-[#16a34a]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Hero-style brand strip ── */}
        <div className="relative py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border-b border-gray-100">

          {/* Logo + tagline */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <VendoorXIcon size={48} />
              <div className="flex flex-col">
                <span className="text-3xl font-black tracking-tight text-gray-950 leading-none">
                  Vendoor<span className="text-[#16a34a]">X</span>
                </span>
                <span className="text-xs text-gray-400 font-medium tracking-widest uppercase">Campus Marketplace</span>
              </div>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Nigeria&apos;s #1 campus marketplace. Buy, sell, and close deals directly on WhatsApp — zero fees, zero friction.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <MapPin className="w-3.5 h-3.5 text-[#16a34a]" />
              <span>Made in Nigeria, built for campus life</span>
            </div>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col gap-3 w-full md:max-w-sm">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#16a34a]" />
              <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Get campus deals in your inbox</p>
            </div>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/10 transition-all"
              />
              <button
                type="submit"
                className="px-4 py-3 rounded-xl bg-[#16a34a] hover:bg-[#15803d] active:scale-95 transition-all flex items-center justify-center text-white shrink-0 shadow-md shadow-green-200"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            {/* Social icons */}
            <div className="flex gap-2 pt-1">
              {[
                { href: 'https://wa.me/', icon: MessageCircle, label: 'WhatsApp', color: '#25D366' },
                { href: 'https://instagram.com/', icon: Instagram, label: 'Instagram', color: '#E1306C' },
                { href: 'https://facebook.com/', icon: Facebook, label: 'Facebook', color: '#1877F2' },
                { href: 'https://twitter.com/', icon: Twitter, label: 'Twitter', color: '#1DA1F2' },
              ].map(({ href, icon: Icon, label, color }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg border border-gray-100 flex items-center justify-center hover:border-transparent hover:shadow-md transition-all hover:scale-110 group bg-white"
                >
                  <Icon className="w-4 h-4 transition-colors" style={{ color }} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-b border-gray-100">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`py-8 px-6 flex flex-col gap-1 ${i < 3 ? 'border-r border-gray-100' : ''}`}
            >
              <span className="text-3xl font-black text-[#16a34a] tracking-tight">{s.value}</span>
              <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Link columns ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 py-12 border-b border-gray-100">
          {Object.entries(LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-5 flex items-center gap-2">
                <span className="inline-block w-4 h-px bg-[#16a34a]" />
                {category}
              </h4>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-[#16a34a] transition-colors group flex items-center gap-1.5"
                    >
                      <span className="inline-block w-0 group-hover:w-2 h-px bg-[#16a34a] transition-all duration-200" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Giant wordmark ── */}
        <div
          aria-hidden="true"
          className="py-6 select-none overflow-hidden"
        >
          <span
            className="text-[clamp(4rem,14vw,10rem)] font-black tracking-tighter leading-none whitespace-nowrap text-transparent"
            style={{
              WebkitTextStroke: '1.5px #e5e7eb',
            }}
          >
            VendoorX
          </span>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-gray-100 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} VendoorX Technologies Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-100">
            <span className="inline-block w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
            <span className="text-xs text-[#16a34a] font-medium">All systems operational</span>
          </div>
          <p className="text-xs text-gray-400">
            Built with love for Nigerian campus entrepreneurs
          </p>
        </div>

      </div>
    </footer>
  )
}
