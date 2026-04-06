import type { Metadata } from 'next'
import Link from 'next/link'
import { Cookie } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Cookie Policy | VendoorX',
  description: 'Learn how VendoorX uses cookies and how to control your cookie preferences.',
}

const LAST_UPDATED = 'April 1, 2026'

const COOKIE_TYPES = [
  {
    name: 'Strictly Necessary',
    required: true,
    desc: 'These cookies are essential for the VendoorX website to function. They cannot be disabled.',
    examples: [
      { name: 'sb-session', purpose: 'Supabase authentication session token — keeps you logged in', duration: 'Session' },
      { name: 'sb-refresh-token', purpose: 'Supabase session refresh token — auto-renews your login', duration: '60 days' },
      { name: '__csrf', purpose: 'Cross-site request forgery protection for form submissions', duration: 'Session' },
    ],
  },
  {
    name: 'Functional',
    required: false,
    desc: 'These cookies remember your preferences to improve your experience.',
    examples: [
      { name: 'theme', purpose: 'Stores your light/dark mode preference', duration: '1 year' },
      { name: 'vx-lang', purpose: 'Stores your language preference', duration: '1 year' },
      { name: 'vx-last-university', purpose: 'Remembers your last selected campus filter', duration: '30 days' },
    ],
  },
  {
    name: 'Analytics',
    required: false,
    desc: 'These cookies help us understand how users interact with VendoorX so we can improve the platform.',
    examples: [
      { name: '_vercel_analytics', purpose: 'Vercel Analytics — anonymous traffic and page performance data', duration: '1 year' },
      { name: 'vx_session_id', purpose: 'Anonymous session tracking for usage pattern analysis', duration: 'Session' },
    ],
  },
  {
    name: 'Marketing',
    required: false,
    desc: 'These cookies are used to show you relevant listings and promotions. VendoorX does not sell this data.',
    examples: [
      { name: 'vx_ref', purpose: 'Referral tracking — credits the user who referred you', duration: '30 days' },
    ],
  },
]

export default function CookiesPage() {
  return (
    <div className="bg-background">

      <section className="py-16 px-4 bg-gradient-to-br from-amber-50 via-background to-background dark:from-amber-950/20 border-b border-border">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Cookie className="w-3.5 h-3.5" />
            Legal
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-4">Cookie Policy</h1>
          <p className="text-muted-foreground">Last updated: {LAST_UPDATED}</p>
          <p className="text-muted-foreground mt-4 leading-relaxed max-w-2xl">
            This policy explains what cookies are, which cookies VendoorX uses, and how you can control them. We aim to use the minimum cookies necessary to operate the platform effectively.
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto flex flex-col gap-12">

          {/* What are cookies */}
          <div>
            <h2 className="text-xl font-black text-foreground mb-4">What Are Cookies?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cookies are small text files stored on your device by your web browser when you visit a website. They allow websites to remember your preferences, keep you logged in, and understand how you use their services. VendoorX uses cookies responsibly and in compliance with the Nigeria Data Protection Act 2023.
            </p>
          </div>

          {/* Cookie types */}
          <div className="flex flex-col gap-8">
            <h2 className="text-xl font-black text-foreground">Cookies We Use</h2>
            {COOKIE_TYPES.map(({ name, required, desc, examples }) => (
              <div key={name} className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className={`px-5 py-4 border-b border-border flex items-center justify-between ${required ? 'bg-primary/5' : 'bg-muted/30'}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-foreground">{name}</h3>
                      {required && (
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">Required</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-md">{desc}</p>
                  </div>
                  {!required && (
                    <div className="w-10 h-5 rounded-full bg-primary/20 flex items-center px-0.5 cursor-pointer hover:bg-primary/30 transition-colors shrink-0">
                      <div className="w-4 h-4 rounded-full bg-primary shadow-sm transition-transform" />
                    </div>
                  )}
                </div>
                <div className="divide-y divide-border">
                  {examples.map(({ name: cName, purpose, duration }) => (
                    <div key={cName} className="px-5 py-3.5 grid grid-cols-5 gap-3 items-start">
                      <code className="col-span-2 text-xs font-mono text-foreground bg-muted px-2 py-1 rounded-md truncate block">{cName}</code>
                      <p className="col-span-2 text-xs text-muted-foreground leading-relaxed">{purpose}</p>
                      <p className="text-xs text-muted-foreground text-right">{duration}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* How to control */}
          <div>
            <h2 className="text-xl font-black text-foreground mb-4">How to Control Cookies</h2>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Browser settings:</strong> Most browsers allow you to view, delete, and block cookies. Note that blocking strictly necessary cookies will prevent VendoorX from functioning. Visit your browser&apos;s help page for instructions.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Opt-out links:</strong> For analytics, you can opt out of Vercel Analytics by enabling "Do Not Track" in your browser settings.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">VendoorX controls:</strong> You can manage functional cookie preferences in your Account Settings → Privacy.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-muted/30 p-5 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <p className="text-sm text-muted-foreground">Questions about cookies?</p>
            <div className="flex gap-4">
              <Link href="/contact" className="text-sm font-semibold text-primary hover:underline">Contact Us</Link>
              <Link href="/privacy" className="text-sm font-semibold text-primary hover:underline">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
