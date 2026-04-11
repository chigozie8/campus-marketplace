import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import Link from 'next/link'
import {
  Shield,
  Lock,
  RotateCcw,
  BadgeCheck,
  Landmark,
  Headphones,
  Phone,
  MessageCircle,
  CheckCircle2,
  ArrowRight,
  Clock,
  Star,
  AlertCircle,
  CreditCard,
  Package,
  UserCheck,
} from 'lucide-react'

export const metadata: Metadata = buildMetadata({
  title: 'Trust & Safety | VendoorX',
  description: 'Your money is protected on VendoorX. Escrow payments, full refund guarantee, verified sellers, and a dispute team on standby. Safe buying and selling across Nigeria.',
  path: '/trust',
  keywords: ['safe buying nigeria', 'escrow payment nigeria', 'verified sellers nigeria', 'vendoorx safety', 'whatsapp commerce safety'],
})

const SUPPORT_PHONE = '07082039250'
const SUPPORT_WHATSAPP = 'https://wa.me/2347082039250?text=Hi%20VendoorX%20Support%2C%20I%20need%20help%20with...'

const ESCROW_STEPS = [
  {
    step: '01',
    icon: CreditCard,
    color: 'bg-emerald-500',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    title: 'You Pay VendoorX — Not the Seller',
    desc: 'When you checkout via Paystack, your money goes to VendoorX\'s secure escrow — never directly to the seller. The seller cannot touch the funds yet.',
  },
  {
    step: '02',
    icon: Package,
    color: 'bg-blue-500',
    textColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-800',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    title: 'Seller Ships Your Item',
    desc: 'The seller is notified and knows they only get paid after successful delivery. This keeps them motivated and accountable to deliver exactly what was listed.',
  },
  {
    step: '03',
    icon: CheckCircle2,
    color: 'bg-purple-500',
    textColor: 'text-purple-600 dark:text-purple-400',
    borderColor: 'border-purple-200 dark:border-purple-800',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    title: 'You Confirm Safe Receipt',
    desc: 'Once you receive your item, you go to Dashboard → Orders and tap "Confirm Delivery." This triggers the escrow release. You have 48 hours to raise any issues first.',
  },
  {
    step: '04',
    icon: Shield,
    color: 'bg-orange-500',
    textColor: 'text-orange-600 dark:text-orange-400',
    borderColor: 'border-orange-200 dark:border-orange-800',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    title: 'Escrow Releases to Seller',
    desc: 'After you confirm delivery (or 48 hours with no dispute), we release funds to the seller\'s wallet. If there\'s a dispute, funds are held until resolved.',
  },
]

const GUARANTEES = [
  {
    icon: RotateCcw,
    title: '100% Full Refund',
    desc: 'Item not delivered, wrong item, or not as described? You get every naira back — no arguments, no forms, no waiting for weeks.',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    border: 'border-orange-200 dark:border-orange-800',
  },
  {
    icon: UserCheck,
    title: 'Verified Sellers',
    desc: 'Every seller verified with their Nigerian email address. You know exactly who you\'re buying from — real, accountable people.',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-200 dark:border-purple-800',
  },
  {
    icon: Lock,
    title: 'Bank-Grade Encryption',
    desc: 'Every transaction encrypted with 256-bit SSL. Payments processed by Paystack, licensed by the Central Bank of Nigeria (CBN).',
    color: 'text-gray-700 dark:text-gray-300',
    bg: 'bg-gray-50 dark:bg-gray-900/40',
    border: 'border-gray-200 dark:border-gray-800',
  },
  {
    icon: Headphones,
    title: 'Nigerian Support Team',
    desc: 'Our support team is Nigerian, locally-based, and based locally. We understand your situation because we\'ve lived it.',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    border: 'border-rose-200 dark:border-rose-800',
  },
  {
    icon: Clock,
    title: 'Fast Dispute Resolution',
    desc: 'Disputes reviewed within 24 hours. Most resolved in under 72 hours. You\'re never left waiting in silence.',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
  },
  {
    icon: BadgeCheck,
    title: 'Zero Fraud Policy',
    desc: 'Fraud, scams, and fake listings result in immediate permanent bans. We actively monitor and act on every report.',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
]

const REFUND_CASES = [
  'Item was never delivered after payment',
  'Item is significantly different from the listing',
  'Item arrived damaged (reported within 48 hours)',
  'Seller is unresponsive for 72+ hours after payment',
  'Counterfeit or fake product delivered',
  'Order cancelled before shipment confirmation',
]

const TIMELINES = [
  { label: 'Dispute window (after delivery)', value: '48 hours' },
  { label: 'First response from support', value: '< 2 hours' },
  { label: 'Dispute resolution target', value: '72 hours' },
  { label: 'Refund processing time', value: '3–5 business days' },
  { label: 'Auto escrow release (no dispute)', value: '48 hrs after delivery' },
]

export default function TrustPage() {
  return (
    <div className="bg-background">

      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-br from-emerald-50 via-background to-background dark:from-emerald-950/20 dark:via-background dark:to-background border-b border-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Shield className="w-3.5 h-3.5" />
            Trust & Safety
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-5 leading-tight">
            Your Money Is{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              100% Protected
            </span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            Every naira you spend on VendoorX is held in secure escrow — never sent directly to the seller
            until you confirm your item arrived safely. If something goes wrong, we have your back.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
            {[
              { stat: '₦0', label: 'Lost to fraud', sub: 'Since launch' },
              { stat: '100%', label: 'Disputes resolved', sub: 'Within 72 hrs' },
              { stat: '4.9★', label: 'Buyer rating', sub: 'From verified buyers' },
            ].map(({ stat, label, sub }) => (
              <div key={label} className="py-4 px-3 rounded-2xl bg-white dark:bg-card border border-border shadow-sm text-center">
                <p className="text-2xl font-black text-foreground">{stat}</p>
                <p className="text-xs font-bold text-foreground mt-0.5">{label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support banner */}
      <div className="bg-emerald-600 dark:bg-emerald-700 py-3 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 text-white text-sm">
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4" />
            <span className="font-semibold">Need help right now?</span>
          </div>
          <div className="flex items-center gap-4">
            <a href={`tel:${SUPPORT_PHONE}`} className="flex items-center gap-1.5 font-black hover:underline">
              <Phone className="w-4 h-4" />
              {SUPPORT_PHONE}
            </a>
            <span className="opacity-50">·</span>
            <a href={SUPPORT_WHATSAPP} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 font-bold hover:underline">
              <MessageCircle className="w-4 h-4" />
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col gap-16">

        {/* Escrow flow */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <Landmark className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground">How Escrow Works — Step by Step</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Every Paystack checkout on VendoorX follows this exact flow</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {ESCROW_STEPS.map(({ step, icon: Icon, color, textColor, borderColor, bg, title, desc }) => (
              <div key={step} className={`rounded-2xl border-2 ${borderColor} ${bg} p-6 flex flex-col gap-4`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white font-black text-sm shrink-0`}>
                    {step}
                  </div>
                  <Icon className={`w-5 h-5 ${textColor}`} />
                </div>
                <div>
                  <h3 className="font-black text-foreground text-base mb-1.5">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center">
            <p className="text-sm text-emerald-800 dark:text-emerald-300 font-semibold">
              ✦ If anything goes wrong at any step, you receive a{' '}
              <span className="font-black">full refund within 3–5 business days</span>.
              No questions asked.
            </p>
          </div>
        </div>

        {/* 6 guarantees */}
        <div>
          <h2 className="text-2xl font-black text-foreground mb-2">Our Six Buyer Guarantees</h2>
          <p className="text-muted-foreground text-sm mb-8">These aren't aspirations — they're the rules we operate by.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {GUARANTEES.map(({ icon: Icon, title, desc, color, bg, border }) => (
              <div key={title} className={`rounded-2xl border-2 ${border} ${bg} p-5 flex flex-col gap-3`}>
                <div className={`w-10 h-10 rounded-xl bg-white dark:bg-card border ${border} flex items-center justify-center shadow-sm`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <h3 className="font-black text-foreground text-sm mb-1">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Refund cases */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-black text-foreground mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              When You Get a Full Refund
            </h2>
            <div className="flex flex-col gap-2.5">
              {REFUND_CASES.map((c) => (
                <div key={c} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">{c}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-black text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              Key Timelines
            </h2>
            <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
              {TIMELINES.map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-4 py-3 gap-4">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-xs font-black text-primary shrink-0">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Support CTA */}
        <div className="rounded-3xl border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 p-8 text-center">
          <div className="w-16 h-16 rounded-3xl bg-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/30">
            <Headphones className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black text-foreground mb-2">Still have questions?</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
            Our Nigerian support team is available Mon – Sat 8am–10pm WAT. Call, WhatsApp, or email us
            — we respond within 2 hours.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5">
            <a
              href={`tel:${SUPPORT_PHONE}`}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all hover:scale-[1.02] shadow-lg shadow-emerald-500/25 active:scale-95"
            >
              <Phone className="w-4 h-4" />
              Call {SUPPORT_PHONE}
            </a>
            <a
              href={SUPPORT_WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold text-sm transition-all hover:scale-[1.02] shadow-lg shadow-green-500/25 active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Support
            </a>
            <a
              href="mailto:support@vendoorx.ng"
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl border-2 border-border bg-background hover:bg-muted text-foreground font-bold text-sm transition-all hover:scale-[1.02] active:scale-95"
            >
              Email Support
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <Link href="/refund" className="hover:text-primary flex items-center gap-1 hover:underline">
              <RotateCcw className="w-3 h-3" /> Refund Policy
            </Link>
            <Link href="/help" className="hover:text-primary flex items-center gap-1 hover:underline">
              <AlertCircle className="w-3 h-3" /> Help Center
            </Link>
            <Link href="/contact" className="hover:text-primary flex items-center gap-1 hover:underline">
              <MessageCircle className="w-3 h-3" /> Contact Us
            </Link>
            <Link href="/disputes" className="hover:text-primary flex items-center gap-1 hover:underline">
              <Shield className="w-3 h-3" /> File a Dispute
            </Link>
          </div>
        </div>

        {/* Compliance */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-center text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6">
            Certified, Compliant &amp; Trusted
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { label: 'NDPR Compliant', sub: 'Nigeria Data Protection Regulation', bg: '#008751' },
              { label: 'CBN Guidelines', sub: 'Central Bank of Nigeria Compliant', bg: '#1a56db' },
              { label: '256-bit SSL', sub: 'Bank-Grade TLS Encryption', bg: '#059669' },
              { label: 'Paystack Powered', sub: 'Trusted by 200,000+ Businesses', bg: '#0ba4db' },
            ].map(({ label, sub, bg }) => (
              <div key={label} className="flex flex-col items-center text-center gap-2">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: bg }}
                >
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-xs font-black text-foreground">{label}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
