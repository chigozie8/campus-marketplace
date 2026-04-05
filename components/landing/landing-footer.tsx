'use client'

import Link from 'next/link'
import { ArrowRight, MessageCircle, Instagram, Facebook, Twitter, MapPin, Star, ShieldCheck, Zap, BookOpen, Headphones, Users, TrendingUp, Store, ChevronRight } from 'lucide-react'

const LINKS = {
  Marketplace: [
    { label: 'Browse Listings', href: '/marketplace', icon: Store },
    { label: 'Post a Listing', href: '/auth/sign-up', icon: TrendingUp },
    { label: 'Top Categories', href: '/marketplace', icon: BookOpen },
    { label: 'Seller Dashboard', href: '/dashboard', icon: Users },
    { label: 'AI Assistant', href: '/assistant', icon: Zap },
  ],
  Company: [
    { label: 'About VendoorX', href: '#', icon: ShieldCheck },
    { label: 'Blog & Updates', href: '#', icon: BookOpen },
    { label: 'Careers', href: '#', icon: Users },
    { label: 'Press Kit', href: '#', icon: TrendingUp },
    { label: 'Partnerships', href: '#', icon: Star },
  ],
  Support: [
    { label: 'Help Center', href: '#', icon: Headphones },
    { label: 'Contact Us', href: '#', icon: MessageCircle },
    { label: 'Report a Bug', href: '#', icon: ShieldCheck },
    { label: 'Community Forum', href: '#', icon: Users },
    { label: 'Status Page', href: '#', icon: Zap },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#', icon: ShieldCheck },
    { label: 'Terms of Service', href: '#', icon: BookOpen },
    { label: 'Cookie Policy', href: '#', icon: BookOpen },
    { label: 'Refund Policy', href: '#', icon: ShieldCheck },
    { label: 'Dispute Resolution', href: '#', icon: Users },
  ],
}

const STATS = [
  { value: '50K+', label: 'Active Students', icon: Users },
  { value: '120+', label: 'Campuses', icon: MapPin },
  { value: '₦2B+', label: 'Transactions', icon: TrendingUp },
  { value: '4.9', label: 'Star Rating', icon: Star },
]

const CATEGORIES = [
  'Electronics', 'Fashion', 'Textbooks', 'Food & Snacks',
  'Gadgets', 'Services', 'Hostel Essentials', 'Stationery',
]

const SOCIALS = [
  { href: 'https://wa.me/', icon: MessageCircle, label: 'WhatsApp', bg: '#25D366', text: 'white' },
  { href: 'https://instagram.com/', icon: Instagram, label: 'Instagram', bg: '#E1306C', text: 'white' },
  { href: 'https://facebook.com/', icon: Facebook, label: 'Facebook', bg: '#1877F2', text: 'white' },
  { href: 'https://twitter.com/', icon: Twitter, label: 'Twitter / X', bg: '#000000', text: 'white' },
]

function VendoorXLogo() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Rounded square base */}
      <rect width="44" height="44" rx="12" fill="#16a34a" />
      {/* Inner subtle highlight */}
      <rect x="3" y="3" width="38" height="38" rx="10" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      {/* V mark */}
      <path d="M10 13l8 18h8l8-18" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* X badge bottom-right */}
      <rect x="27" y="27" width="13" height="13" rx="4" fill="white" />
      <path d="M30 30l7 7M37 30l-7 7" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

export function LandingFooter() {
  return (
    <footer className="bg-white border-t-4 border-[#16a34a] font-sans overflow-hidden">

      {/* ════════════════════════════════════════
          TOP BAND — brand + newsletter + socials
         ════════════════════════════════════════ */}
      <div className="bg-[#f0fdf4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left — brand */}
          <div className="flex flex-col gap-5">
            <Link href="/" className="flex items-center gap-3.5 w-fit group">
              <div className="transition-transform group-hover:scale-105 duration-200">
                <VendoorXLogo />
              </div>
              <div className="flex flex-col">
                <span className="text-[28px] font-black tracking-tight text-gray-950 leading-none">
                  Vendoor<span className="text-[#16a34a]">X</span>
                </span>
                <span className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-semibold mt-0.5">
                  Campus Marketplace
                </span>
              </div>
            </Link>

            <p className="text-gray-600 text-sm leading-relaxed max-w-md">
              Nigeria&apos;s #1 campus marketplace. Buy, sell, and close deals directly on WhatsApp — zero fees, zero friction, just fast campus commerce.
            </p>

            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <span
                  key={cat}
                  className="text-xs font-medium px-3 py-1 rounded-full bg-white border border-[#16a34a]/20 text-[#15803d] hover:bg-[#16a34a] hover:text-white hover:border-[#16a34a] transition-all cursor-pointer"
                >
                  {cat}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <MapPin className="w-3.5 h-3.5 text-[#16a34a]" />
              Made in Nigeria — built for campus hustle
            </div>
          </div>

          {/* Right — newsletter + socials */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#16a34a] mb-2">Stay in the loop</p>
              <h3 className="text-2xl font-black text-gray-950 leading-tight mb-1">
                Get the best campus deals<br />
                <span className="text-[#16a34a]">before anyone else.</span>
              </h3>
              <p className="text-sm text-gray-500">Join 50,000+ students getting weekly deal alerts.</p>
            </div>

            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your university email"
                className="flex-1 min-w-0 px-4 py-3.5 rounded-xl bg-white border-2 border-gray-200 focus:border-[#16a34a] text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all"
              />
              <button
                type="submit"
                className="px-5 py-3.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] active:scale-95 text-white text-sm font-bold flex items-center gap-2 shrink-0 transition-all shadow-lg shadow-green-200"
              >
                Subscribe <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="flex flex-col gap-2">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Follow us</p>
              <div className="flex gap-2.5">
                {SOCIALS.map(({ href, icon: Icon, label, bg, text }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all hover:scale-105 hover:shadow-md"
                    style={{ backgroundColor: bg, color: text }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          STATS ROW
         ════════════════════════════════════════ */}
      <div className="border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {STATS.map(({ value, label, icon: Icon }, i) => (
              <div
                key={label}
                className={`py-8 px-6 flex items-center gap-4 ${i < STATS.length - 1 ? 'border-r border-gray-100' : ''}`}
              >
                <div className="w-12 h-12 rounded-xl bg-[#f0fdf4] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#16a34a]" />
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-950 leading-none">{value}</p>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          LINK COLUMNS
         ════════════════════════════════════════ */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {Object.entries(LINKS).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-950 mb-5 pb-3 border-b-2 border-[#16a34a] w-fit">
                  {category}
                </h4>
                <ul className="flex flex-col gap-3">
                  {links.map(({ label, href, icon: Icon }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="group flex items-center gap-2 text-sm text-gray-500 hover:text-[#16a34a] transition-colors"
                      >
                        <Icon className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#16a34a] transition-colors shrink-0" />
                        <span>{label}</span>
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all ml-auto" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          TRUST BADGES STRIP
         ════════════════════════════════════════ */}
      <div className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6">
              {[
                { icon: ShieldCheck, text: 'Verified Sellers' },
                { icon: Zap, text: 'WhatsApp Powered' },
                { icon: Star, text: '4.9 Rated Platform' },
                { icon: Users, text: '50K+ Active Users' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                  <Icon className="w-4 h-4 text-[#16a34a]" />
                  {text}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-green-200 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
              <span className="text-xs font-semibold text-[#16a34a]">All systems operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          BOTTOM BAR
         ════════════════════════════════════════ */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} VendoorX Technologies Ltd. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 italic">
            Connecting Nigerian campuses, one deal at a time.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link href="#" className="hover:text-[#16a34a] transition-colors">Privacy</Link>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <Link href="#" className="hover:text-[#16a34a] transition-colors">Terms</Link>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <Link href="#" className="hover:text-[#16a34a] transition-colors">Cookies</Link>
          </div>
        </div>
      </div>

    </footer>
  )
}
