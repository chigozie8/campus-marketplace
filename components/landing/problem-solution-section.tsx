import { X, Check, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const BEFORE = [
  '47 unread WhatsApp chats you forgot to reply to',
  'Customers asking "is this available?" every day',
  'Forgot who paid and who still owes you',
  'No record of what sold, when, or to whom',
  'Screenshots of orders scattered across your phone',
  'Lost repeat customers because you lost their contact',
]

const AFTER = [
  'One clean inbox — every order tracked automatically',
  'Your store link answers availability 24/7',
  'Instant payment confirmation via Paystack webhook',
  'Full order history, revenue, and top products at a glance',
  'Structured orders with buyer info stored forever',
  'Built-in customer records so you never forget a buyer',
]

export function ProblemSolutionSection() {
  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-primary text-sm font-semibold uppercase tracking-widest mb-4 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            Why VendoorX Exists
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground text-balance mt-4 mb-5">
            Running a business in your DMs{' '}
            <span className="text-primary">is chaos.</span>
          </h2>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed text-pretty">
            You built a customer base. Your products sell. But managing it all through WhatsApp alone is costing you money and sleep.
          </p>
        </div>

        {/* Comparison cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-6 relative">
          {/* VS Badge — only visible on desktop */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-background border-2 border-border shadow-xl items-center justify-center">
            <span className="text-xs font-black text-muted-foreground tracking-widest">VS</span>
          </div>

          {/* Before card */}
          <div className="rounded-t-3xl lg:rounded-3xl border border-border bg-muted/40 dark:bg-muted/20 p-8 lg:p-10 flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
                <X className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-red-500/80 mb-1">Before VendoorX</p>
                <h3 className="text-xl font-bold text-foreground">Managing it all in your chats</h3>
              </div>
            </div>

            <ul className="flex flex-col gap-3.5">
              {BEFORE.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center mt-0.5">
                    <X className="w-3 h-3 text-red-500" />
                  </div>
                  <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-6 border-t border-border">
              <p className="text-sm font-semibold text-red-500/80">Result: Revenue leaking. Buyers moving on. Burnout.</p>
            </div>
          </div>

          {/* Mobile VS divider */}
          <div className="flex lg:hidden items-center justify-center gap-4 py-4 bg-background relative z-10">
            <div className="flex-1 h-px bg-border" />
            <span className="px-4 py-1.5 rounded-full bg-background border-2 border-border text-xs font-black text-muted-foreground tracking-widest shadow">VS</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* After card */}
          <div className="rounded-b-3xl lg:rounded-3xl border-2 border-primary/30 bg-primary/5 dark:bg-primary/10 p-8 lg:p-10 flex flex-col gap-6 relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl" />
            </div>

            <div className="flex items-start gap-4 relative z-10">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <Check className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">With VendoorX</p>
                <h3 className="text-xl font-bold text-foreground">A real store that runs itself</h3>
              </div>
            </div>

            <ul className="flex flex-col gap-3.5 relative z-10">
              {AFTER.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm text-foreground/80 font-medium leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-6 border-t border-primary/20 relative z-10">
              <p className="text-sm font-semibold text-primary mb-4">Result: More sales, less stress, real business records.</p>
              <Button
                size="sm"
                className="group rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 shadow-lg shadow-primary/25 transition-all hover:scale-[1.02]"
                asChild
              >
                <Link href="/auth/sign-up">
                  Start for free
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
