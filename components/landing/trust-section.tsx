'use client'

import { Shield, Lock, RotateCcw, BadgeCheck, Landmark, Eye, Users, Headphones } from 'lucide-react'
import Link from 'next/link'

const TRUST_PILLARS = [
  {
    icon: Landmark,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-100 dark:border-emerald-900/50',
    title: 'Escrow-Protected Payments',
    body:
      'Your money is never sent directly to the seller. VendoorX holds it in secure escrow until you confirm your item arrived safely — then we release the funds.',
    badge: 'Buyer Protected',
    badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  },
  {
    icon: Shield,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-100 dark:border-blue-900/50',
    title: 'Paystack Secure Checkout',
    body:
      'All payments are processed by Paystack — Nigeria\'s most trusted payment gateway, licensed by the Central Bank of Nigeria (CBN). We never store your card details.',
    badge: 'CBN Licensed',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  },
  {
    icon: RotateCcw,
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    border: 'border-orange-100 dark:border-orange-900/50',
    title: 'Full Refund Guarantee',
    body:
      'If your item never arrives, or it\'s significantly different from what was listed, you get a full refund — no arguments, no hassle. We have your back.',
    badge: '100% Refundable',
    badgeColor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
  },
  {
    icon: BadgeCheck,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-purple-100 dark:border-purple-900/50',
    title: 'Verified Student Sellers',
    body:
      'Every seller on VendoorX must verify with their Nigerian university email address. You know exactly who you\'re buying from — a real student at a real campus.',
    badge: 'University Verified',
    badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  },
  {
    icon: Lock,
    color: 'text-gray-700 dark:text-gray-300',
    bg: 'bg-gray-50 dark:bg-gray-900/40',
    border: 'border-gray-100 dark:border-gray-800/50',
    title: '256-Bit SSL Encryption',
    body:
      'Every page, every transaction, every message is encrypted with bank-grade 256-bit SSL. Your personal details and payment data are completely private.',
    badge: 'Bank-Grade SSL',
    badgeColor: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  },
  {
    icon: Headphones,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-100 dark:border-rose-900/50',
    title: '24/7 Dispute Resolution',
    body:
      'Got a problem? Our Nigerian support team reviews every dispute within 24 hours. We\'re not overseas — we understand campus life in Nigeria deeply.',
    badge: 'Nigerian Support',
    badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
  },
]

const COMPLIANCE_BADGES = [
  {
    label: 'NDPR Compliant',
    sub: 'Nigeria Data Protection Regulation',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" fill="#008751" />
        <path d="M9 16.5L13.5 21L23 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'CBN Compliant',
    sub: 'Central Bank of Nigeria Guidelines',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" fill="#1a56db" />
        <path d="M16 8l2.2 4.4 4.8.7-3.5 3.4.8 4.8L16 19l-4.3 2.3.8-4.8L9 13.1l4.8-.7z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="white" />
      </svg>
    ),
  },
  {
    label: 'SSL Secured',
    sub: '256-bit TLS Encryption',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" fill="#059669" />
        <rect x="10" y="15" width="12" height="9" rx="2" fill="white" />
        <path d="M12 15v-3a4 4 0 018 0v3" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="19.5" r="1.5" fill="#059669" />
      </svg>
    ),
  },
  {
    label: 'Paystack Powered',
    sub: 'Trusted by 200,000+ Nigerian businesses',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" fill="#0ba4db" />
        <path d="M8 20h3.5a3.5 3.5 0 000-7H8v14" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 13h4.5a5.5 5.5 0 010 11H8" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      </svg>
    ),
  },
]

const HOW_IT_WORKS_STEPS = [
  { step: '1', text: 'You pay VendoorX (not the seller) via Paystack', color: 'bg-emerald-500' },
  { step: '2', text: 'Seller is notified and delivers your item', color: 'bg-blue-500' },
  { step: '3', text: 'You confirm safe receipt in your dashboard', color: 'bg-purple-500' },
  { step: '4', text: 'We release payment to the seller — job done', color: 'bg-orange-500' },
]

export function TrustSection() {
  return (
    <section id="trust" className="py-20 sm:py-28 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 mb-4">
            <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-widest">
              Your Money Is Safe
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-950 dark:text-white mb-4 tracking-tight">
            Built for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              Nigerian Students
            </span>{' '}
            to Trust
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            We know trust is earned, not demanded. That&apos;s why every naira on VendoorX is
            protected end-to-end — from the moment you pay to the moment your item arrives.
          </p>
        </div>

        {/* Escrow flow explainer */}
        <div className="mb-16 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center">
              <Landmark className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-black text-gray-950 dark:text-white text-lg">
              How Escrow Protection Works
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOW_IT_WORKS_STEPS.map(({ step, text, color }) => (
              <div key={step} className="flex sm:flex-col items-start sm:items-center sm:text-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center text-white font-black text-sm flex-shrink-0`}>
                  {step}
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{text}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-gray-400 dark:text-gray-500 text-center">
            If anything goes wrong at step 2 or 3, you get a{' '}
            <span className="font-bold text-emerald-600 dark:text-emerald-400">100% refund</span>{' '}
            — no questions asked.
          </p>
        </div>

        {/* Trust pillars grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {TRUST_PILLARS.map(({ icon: Icon, color, bg, border, title, body, badge, badgeColor }) => (
            <div
              key={title}
              className={`rounded-2xl border ${border} ${bg} p-6 flex flex-col gap-4`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className={`w-11 h-11 rounded-xl bg-white dark:bg-gray-800 border ${border} flex items-center justify-center shadow-sm flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${badgeColor}`}>
                  {badge}
                </span>
              </div>
              <div>
                <h3 className="font-black text-gray-950 dark:text-white text-base mb-1.5">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Compliance badge strip */}
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8 mb-12">
          <p className="text-center text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">
            Certified, Compliant &amp; Audited
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {COMPLIANCE_BADGES.map(({ label, sub, icon }) => (
              <div key={label} className="flex flex-col items-center text-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center shadow-sm">
                  {icon}
                </div>
                <div>
                  <p className="text-xs font-black text-gray-900 dark:text-white">{label}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social proof strip */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { stat: '₦0', label: 'Funds ever lost to fraud', sub: 'Since launch' },
            { stat: '100%', label: 'Disputes resolved', sub: 'Within 24 hours' },
            { stat: '4.9★', label: 'Buyer satisfaction', sub: 'From 12,500+ reviews' },
          ].map(({ stat, label, sub }) => (
            <div key={label} className="text-center py-5 px-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <p className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white">{stat}</p>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1">{label}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
            <Eye className="w-4 h-4" />
            <span>Questions about our safety systems?</span>
          </div>
          <Link
            href="/help"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline underline-offset-4"
          >
            Read the Safety FAQ
            <Users className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  )
}
