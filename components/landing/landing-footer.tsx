'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowRight, MapPin, Star, ShieldCheck, Zap, BookOpen, Users, TrendingUp,
  ChevronRight, Phone, Mail, Loader2, CheckCircle2, Lock,
} from 'lucide-react'
import type { SiteSettings, FooterSocial } from '@/lib/site-settings-defaults'
import { parseFooterSocials } from '@/lib/site-settings-defaults'
import { getSocialChip } from '@/components/landing/social-icons'

const LINKS = {
  Company: [
    { label: 'About VendoorX',   href: '/about',        icon: ShieldCheck },
    { label: 'Blog & Updates',   href: '/blog',         icon: BookOpen },
    { label: 'Careers',          href: '/careers',      icon: Users },
    { label: 'Press Kit',        href: '/press',        icon: TrendingUp },
  ],
  Legal: [
    { label: 'Trust & Safety',      href: '/trust',     icon: ShieldCheck },
    { label: 'Privacy Policy',      href: '/privacy',   icon: ShieldCheck },
    { label: 'Terms of Service',    href: '/terms',     icon: BookOpen },
    { label: 'Cookie Policy',       href: '/cookies',   icon: BookOpen },
    { label: 'Refund Policy',       href: '/refund',    icon: ShieldCheck },
    { label: 'Dispute Resolution',  href: '/dispute',   icon: Users },
  ],
}

const SPONSORS = [
  { name: 'UNILAG',  full: 'University of Lagos' },
  { name: 'UI',      full: 'University of Ibadan' },
  { name: 'OAU',     full: 'Obafemi Awolowo University' },
  { name: 'ABU',     full: 'Ahmadu Bello University, Zaria' },
  { name: 'BUK',     full: 'Bayero University, Kano' },
  { name: 'UNN',     full: 'University of Nigeria, Nsukka' },
  { name: 'UNIBEN',  full: 'University of Benin' },
  { name: 'UNIPORT', full: 'University of Port Harcourt' },
  { name: 'FUTA',    full: 'Federal University of Technology, Akure' },
  { name: 'COVENANT',full: 'Covenant University' },
]

/**
 * Newsletter form — login-gated. The server route ALWAYS uses the verified
 * session email, so we visually lock the email input to the user's address.
 * Visitors who aren't logged in see a "Log in to subscribe" prompt instead
 * of an open email input — preventing spam and matching server enforcement.
 */
function NewsletterForm({ userEmail, userFirstName }: { userEmail?: string | null; userFirstName?: string | null }) {
  const [firstName, setFirstName] = useState(userFirstName ?? '')
  const [status, setStatus]       = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errMsg, setErrMsg]       = useState('')

  const isAuthed = !!userEmail

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isAuthed) return
    setStatus('loading')
    setErrMsg('')
    try {
      // Email is intentionally NOT sent — the server uses the verified
      // session email. We pass firstName only.
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName }),
      })
      const json = await res.json()
      if (!res.ok) {
        setErrMsg(json.error || 'Something went wrong. Please try again.')
        setStatus('error')
        return
      }
      setStatus('success')
    } catch {
      setErrMsg('Network error. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-primary/10 border border-primary/20">
        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
        <div>
          <p className="text-sm font-bold text-foreground">You&apos;re subscribed! 🎉</p>
          <p className="text-xs text-muted-foreground mt-0.5">Check your inbox for a welcome email.</p>
        </div>
      </div>
    )
  }

  if (!isAuthed) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/40 p-5">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Lock className="w-4 h-4 text-primary" />
          Sign in to subscribe
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          To stop spam, newsletter sign-ups must use your registered VendoorX email address. Log in or create your free account to get the weekly campus deals digest.
        </p>
        <div className="flex gap-2">
          <Link
            href="/auth/login?next=/"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/auth/signup?next=/"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-border hover:border-primary hover:text-primary text-xs font-bold transition-colors"
          >
            Sign up free
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form className="flex flex-col gap-2.5" onSubmit={handleSubmit}>
      <input
        type="text"
        value={firstName}
        onChange={e => setFirstName(e.target.value)}
        placeholder="First name (optional)"
        maxLength={60}
        className="w-full px-4 py-3.5 rounded-xl bg-background border-2 border-border focus:border-primary text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all"
      />
      <div className="relative">
        <input
          type="email"
          value={userEmail ?? ''}
          readOnly
          aria-label="Your registered email — used to subscribe"
          title="Newsletter sign-ups are restricted to your registered VendoorX email."
          className="w-full pl-4 pr-10 py-3.5 rounded-xl bg-muted/60 border-2 border-border text-sm text-foreground/80 cursor-not-allowed outline-none"
        />
        <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
      </div>
      <p className="text-[11px] text-muted-foreground">
        Locked to your registered email — only this address may subscribe.
      </p>
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full px-5 py-3.5 rounded-xl bg-primary hover:bg-primary/90 active:scale-95 disabled:opacity-60 text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 shrink-0 transition-all shadow-lg shadow-primary/20"
      >
        {status === 'loading'
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Subscribing...</>
          : <>Subscribe <ArrowRight className="w-4 h-4" /></>}
      </button>
      {status === 'error' && (
        <p className="text-xs text-red-500 mt-1">{errMsg}</p>
      )}
    </form>
  )
}

interface FooterProps {
  settings?: Partial<SiteSettings>
  userEmail?: string | null
  userFirstName?: string | null
}

export function LandingFooter({ settings, userEmail, userFirstName }: FooterProps) {
  // Resolve dynamic socials (admin-managed list).
  const socials: FooterSocial[] = parseFooterSocials(settings?.footer_socials ?? '')
    .filter(s => s.enabled !== '0' && (s.href || '').trim().length > 0)

  // Resolve copyright with {year} interpolation.
  const copyrightTemplate = settings?.footer_copyright || '© {year} VendoorX Technologies Ltd. All rights reserved.'
  const copyright = copyrightTemplate.replace(/\{year\}/g, String(new Date().getFullYear()))

  return (
    <footer className="bg-background border-t border-border font-sans overflow-hidden">

      {/* ── TOP BAND — brand + newsletter + socials ── */}
      <div className="bg-primary/5 dark:bg-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left — brand + contact */}
          <div className="flex flex-col gap-5">
            <Link href="/" className="flex items-center gap-2.5 w-fit group select-none">
              <div className="relative w-8 h-8 shrink-0">
                <div className="absolute top-0 left-0 w-[22px] h-[22px] rounded-[5px] bg-gray-950 dark:bg-white" />
                <div className="absolute bottom-0 right-0 w-[22px] h-[22px] rounded-[5px] bg-[#16a34a] opacity-90" />
              </div>
              <span className="text-[1.5rem] font-black tracking-tight text-foreground leading-none group-hover:opacity-80 transition-opacity">
                Vendoor<span className="text-primary">X</span>
              </span>
            </Link>

            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              Nigeria&apos;s campus marketplace, powered by WhatsApp. Buy and sell with classmates from 120+ universities — zero commission, free to start.
            </p>

            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                Made in Nigeria — built for Nigerian students
              </div>
              <a
                href="tel:+15792583013"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                +1 (579) 258-3013
              </a>
              <a
                href="mailto:hello@vendoorx.ng"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                hello@vendoorx.ng
              </a>
            </div>

            {/* Social icons — admin-managed */}
            {socials.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">Follow us</p>
                <div className="flex items-center gap-3 flex-wrap">
                  {socials.map((s, i) => {
                    const chip = getSocialChip(s.platform, s.label || s.platform)
                    return (
                      <a
                        key={`${s.platform}-${i}`}
                        href={s.href}
                        aria-label={chip.label}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={chip.label}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg shadow-sm shrink-0"
                        style={{ background: chip.bg }}
                      >
                        {chip.icon}
                      </a>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right — newsletter */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Stay in the loop</p>
              <h3 className="text-2xl font-black text-foreground leading-tight mb-1">
                Weekly campus deals,<br />
                <span className="text-primary">straight to your inbox.</span>
              </h3>
              <p className="text-sm text-muted-foreground">Join thousands of students getting deal alerts &amp; seller tips every week.</p>
            </div>

            <NewsletterForm userEmail={userEmail} userFirstName={userFirstName} />

            <p className="text-xs text-muted-foreground">
              No spam. Unsubscribe anytime. We respect your privacy.
            </p>
          </div>
        </div>
      </div>

      {/* ── ACTIVE CITIES STRIP ── */}
      <div className="border-t border-border bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Active on campuses across Nigeria
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {SPONSORS.map(({ name, full }) => (
              <div
                key={name}
                title={full}
                className="px-3.5 py-1.5 rounded-full bg-background border border-border text-xs font-bold text-muted-foreground hover:border-primary/40 hover:text-primary transition-all cursor-default"
              >
                {name}
              </div>
            ))}
            <div className="px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
              +110 more universities
            </div>
          </div>
        </div>
      </div>

      {/* ── LINK COLUMNS ── */}
      <div className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 gap-10">
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

      {/* ── TRUST BADGES STRIP ── */}
      <div className="bg-muted/50 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-5">
              {[
                { icon: ShieldCheck, text: 'Verified Sellers' },
                { icon: Zap,         text: 'WhatsApp Powered' },
                { icon: Star,        text: '4.9 Rated Platform' },
                { icon: Users,       text: 'Active Seller Community' },
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

      {/* ── BOTTOM BAR ── */}
      <div className="bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            {copyright}
          </p>
          <p className="text-xs text-muted-foreground italic hidden md:block">
            Connecting Nigerian students, one campus at a time.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <span className="w-1 h-1 rounded-full bg-border" />
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <span className="w-1 h-1 rounded-full bg-border" />
            <Link href="/cookies" className="hover:text-primary transition-colors">Cookies</Link>
          </div>
        </div>
      </div>

    </footer>
  )
}
