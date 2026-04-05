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

const SOCIALS = [
  {
    href: 'https://wa.me/',
    label: 'WhatsApp',
    bg: '#25D366',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.533 5.85L.057 23.928a.5.5 0 0 0 .606.65l6.277-1.642A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.878 9.878 0 0 1-5.029-1.373l-.36-.214-3.733.977.998-3.645-.235-.375A9.865 9.865 0 0 1 2.1 12C2.1 6.534 6.534 2.1 12 2.1c5.466 0 9.9 4.434 9.9 9.9 0 5.466-4.434 9.9-9.9 9.9z" />
      </svg>
    ),
  },
  {
    href: 'https://instagram.com/',
    label: 'Instagram',
    bg: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)',
    icon: <Instagram className="w-4 h-4 text-white" />,
  },
  {
    href: 'https://facebook.com/',
    label: 'Facebook',
    bg: '#1877F2',
    icon: <Facebook className="w-4 h-4 text-white" />,
  },
  {
    href: 'https://twitter.com/',
    label: 'Twitter / X',
    bg: '#000000',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zM17.083 19.77h1.833L7.084 4.126H5.117L17.083 19.77z" />
      </svg>
    ),
  },
  {
    href: 'https://tiktok.com/',
    label: 'TikTok',
    bg: '#010101',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.77 1.52V6.76a4.85 4.85 0 0 1-1-.07z" />
      </svg>
    ),
  },
]



export function LandingFooter() {
  return (
    <footer className="bg-background border-t border-border font-sans overflow-hidden">

      {/* TOP BAND — brand + newsletter + socials */}
      <div className="bg-primary/5 dark:bg-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left — brand */}
          <div className="flex flex-col gap-5">
            <Link href="/" className="flex flex-col w-fit group select-none">
              <span className="text-[1.6rem] font-black tracking-tight text-foreground leading-none group-hover:opacity-80 transition-opacity">
                Vendoor<span className="text-primary">X</span>
              </span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-semibold mt-1">
                Campus Marketplace
              </span>
            </Link>

            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              Nigeria&apos;s #1 campus marketplace. Buy, sell, and close deals directly on WhatsApp — zero fees, zero friction, just fast campus commerce.
            </p>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              Made in Nigeria — built for campus hustle
            </div>

            {/* Social icons — circles only */}
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">Follow us</p>
              <div className="flex items-center gap-3">
                {SOCIALS.map(({ href, label, bg, icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={label}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg shadow-sm shrink-0"
                    style={{ background: bg }}
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right — newsletter */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Stay in the loop</p>
              <h3 className="text-2xl font-black text-foreground leading-tight mb-1">
                Get the best campus deals<br />
                <span className="text-primary">before anyone else.</span>
              </h3>
              <p className="text-sm text-muted-foreground">Join thousands of students getting weekly deal alerts.</p>
            </div>

            <form className="flex flex-col sm:flex-row gap-2.5" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your university email"
                className="flex-1 min-w-0 px-4 py-3.5 rounded-xl bg-background border-2 border-border focus:border-primary text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all"
              />
              <button
                type="submit"
                className="px-5 py-3.5 rounded-xl bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 shrink-0 transition-all shadow-lg shadow-primary/20"
              >
                Subscribe <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <p className="text-xs text-muted-foreground">
              No spam. Unsubscribe anytime. We respect your privacy.
            </p>
          </div>
        </div>
      </div>

      {/* LINK COLUMNS */}
      <div className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-10">
            {Object.entries(LINKS).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-xs font-black uppercase tracking-widest text-foreground mb-5">
                  {category}
                </h4>
                <ul className="flex flex-col gap-3">
                  {links.map(({ label, href, icon: Icon }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Icon className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
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

      {/* TRUST BADGES STRIP */}
      <div className="bg-muted/50 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-5">
              {[
                { icon: ShieldCheck, text: 'Verified Sellers' },
                { icon: Zap, text: 'WhatsApp Powered' },
                { icon: Star, text: '4.9 Rated Platform' },
                { icon: Users, text: 'Active Student Community' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                  {text}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-background border border-primary/30 shadow-sm shrink-0">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold text-primary">All systems operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            &copy; {new Date().getFullYear()} VendoorX Technologies Ltd. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground italic hidden md:block">
            Connecting Nigerian campuses, one deal at a time.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            <span className="w-1 h-1 rounded-full bg-border" />
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
            <span className="w-1 h-1 rounded-full bg-border" />
            <Link href="#" className="hover:text-primary transition-colors">Cookies</Link>
          </div>
        </div>
      </div>

    </footer>
  )
}
