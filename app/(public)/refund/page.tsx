import type { Metadata } from 'next'
import Link from 'next/link'
import { RefreshCw, Shield, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Refund & Dispute Policy | VendoorX',
  description: 'Understand VendoorX\'s refund policy, buyer protection, and how we handle disputes between buyers and sellers.',
}

const LAST_UPDATED = 'April 1, 2026'

const STEPS = [
  { icon: AlertCircle, step: '1', title: 'Report the Problem', desc: 'Go to your order in the Dashboard → Orders tab. Click "Report a Problem" within 24 hours of confirmed delivery.' },
  { icon: RefreshCw, step: '2', title: 'Investigation Begins', desc: 'Our Trust & Safety team reviews your report and contacts both buyer and seller within 24 hours for additional evidence.' },
  { icon: Shield, step: '3', title: 'Mediation', desc: 'We attempt to resolve the dispute by reviewing photos, chat logs, and evidence provided. Most disputes are resolved within 72 hours.' },
  { icon: CheckCircle2, step: '4', title: 'Resolution & Refund', desc: 'If the dispute is resolved in the buyer\'s favour, a full refund is issued to the original payment method within 3–5 business days.' },
]

const REFUNDABLE = [
  'Item not delivered after confirmed payment',
  'Item significantly different from the listing description',
  'Item is counterfeit or not as advertised',
  'Item arrives damaged (must be reported within 24 hours)',
  'Seller does not respond for 72+ hours after payment',
  'Order cancelled before delivery confirmation',
]

const NOT_REFUNDABLE = [
  'Buyer changes their mind after delivery (change of mind)',
  'WhatsApp direct deals made outside VendoorX checkout',
  'Disputes raised after the 24-hour window',
  'Items returned in a different condition than delivered',
  'Digital products that have been downloaded or used',
]

export default function RefundPage() {
  return (
    <div className="bg-background">

      <section className="py-16 px-4 bg-gradient-to-br from-green-50 via-background to-background dark:from-green-950/20 border-b border-border">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
            <RefreshCw className="w-3.5 h-3.5" />
            Buyer Protection
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-4">Refund & Dispute Policy</h1>
          <p className="text-muted-foreground">Last updated: {LAST_UPDATED}</p>
          <p className="text-muted-foreground mt-4 leading-relaxed max-w-2xl">
            VendoorX holds all Paystack checkout payments in escrow until delivery is confirmed. This protects buyers and ensures sellers only receive payment when the deal is complete.
          </p>
        </div>
      </section>

      <section className="py-14 px-4">
        <div className="max-w-3xl mx-auto flex flex-col gap-12">

          {/* Escrow explainer */}
          <div id="escrow" className="scroll-mt-24 rounded-2xl border-2 border-primary/20 bg-primary/5 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-black text-foreground mb-2">How Escrow Protection Works</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  When a buyer pays via Paystack checkout, VendoorX holds the funds in a secure escrow wallet. The seller does not receive payment until one of two things happens:
                </p>
                <ul className="flex flex-col gap-2">
                  {[
                    'The buyer clicks "Confirm Delivery" — funds are released to the seller immediately.',
                    '24 hours pass after the stated delivery date with no dispute raised — funds are released automatically.',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">{item}</p>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                  <strong className="text-foreground">Note:</strong> WhatsApp direct deals (outside the VendoorX checkout) are not covered by escrow. Use the checkout feature for full buyer protection.
                </p>
              </div>
            </div>
          </div>

          {/* What is / isn't refundable */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-2xl border-2 border-green-200 dark:border-green-900/40 bg-green-50 dark:bg-green-950/20 p-5">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <h3 className="text-sm font-black text-foreground">Eligible for Refund</h3>
              </div>
              <ul className="flex flex-col gap-2.5">
                {REFUNDABLE.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0 mt-1.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">{item}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border-2 border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <h3 className="text-sm font-black text-foreground">Not Eligible for Refund</h3>
              </div>
              <ul className="flex flex-col gap-2.5">
                {NOT_REFUNDABLE.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Dispute process */}
          <div id="disputes" className="scroll-mt-24">
            <h2 className="text-xl font-black text-foreground mb-6">Dispute Resolution Process</h2>
            <div className="flex flex-col gap-0">
              {STEPS.map(({ icon: Icon, step, title, desc }, i) => (
                <div key={step} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    {i < STEPS.length - 1 && <div className="w-px flex-1 bg-border my-2" />}
                  </div>
                  <div className="pb-8">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Step {step}</p>
                    <h3 className="text-base font-black text-foreground mb-2">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timelines */}
          <div>
            <h2 className="text-xl font-black text-foreground mb-4">Key Timelines</h2>
            <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
              {[
                { label: 'Window to raise a dispute', value: '24 hours after delivery' },
                { label: 'Initial response from support', value: 'Within 24 hours' },
                { label: 'Dispute resolution target', value: '72 hours' },
                { label: 'Refund processing time', value: '3–5 business days' },
                { label: 'Auto-release of escrow (no dispute)', value: '24 hours after delivery date' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-5 py-3.5 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                    <p className="text-sm text-foreground">{label}</p>
                  </div>
                  <p className="text-sm font-bold text-primary shrink-0">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-6">
            <h2 className="text-lg font-black text-foreground mb-1">Need to raise a dispute or request a refund?</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Our Nigerian support team is ready to help. We respond within 2 hours during business hours.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="tel:07082039250"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/25"
              >
                📞 Call 07082039250
              </a>
              <a
                href="https://wa.me/2347082039250?text=Hi%20VendoorX%20Support%2C%20I%20want%20to%20request%20a%20refund%20for%20my%20order..."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold text-sm transition-all hover:scale-105 active:scale-95"
              >
                💬 WhatsApp Support
              </a>
              <Link
                href="/contact"
                className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-border bg-background hover:bg-muted text-foreground font-bold text-sm transition-all hover:scale-105 active:scale-95"
              >
                Email Support
              </Link>
            </div>
            <p className="text-[11px] text-muted-foreground mt-4">Mon – Sat: 8am – 10pm WAT · Sunday: 10am – 6pm WAT</p>
          </div>
        </div>
      </section>

    </div>
  )
}
