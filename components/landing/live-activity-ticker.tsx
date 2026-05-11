'use client'

import { useEffect, useState } from 'react'
import { m, AnimatePresence, LazyMotion, domAnimation } from 'framer-motion'
import { ShoppingBag, UserPlus, TrendingUp, CheckCircle2, MessageCircle, Star } from 'lucide-react'

const EVENTS = [
  { icon: ShoppingBag,   color: 'bg-primary/10 text-primary',                              text: 'Tobi from UNILAG just placed an order',     sub: 'Infinix Hot 40 · ₦135,000' },
  { icon: UserPlus,      color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40',             text: 'Adaeze just joined VendoorX',               sub: 'Fashion seller · Lagos' },
  { icon: TrendingUp,    color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40',    text: 'Chidi received a payout',                  sub: '₦87,500 to GT Bank' },
  { icon: CheckCircle2,  color: 'bg-teal-50 text-teal-600 dark:bg-teal-950/40',             text: 'Delivery confirmed',                       sub: 'Ankara fabric 6yds · ₦12,000' },
  { icon: MessageCircle, color: 'bg-primary/10 text-primary',                              text: 'AI replied to 14 buyers while Fatima slept', sub: 'Auto-pilot is working' },
  { icon: Star,          color: 'bg-yellow-50 text-yellow-500 dark:bg-yellow-950/40',       text: 'Emeka got a 5-star review',                sub: '"Super fast delivery, trusted seller"' },
  { icon: ShoppingBag,   color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40',             text: 'Flash sale started by Ngozi',              sub: 'Nike Sneakers · ₦45,000' },
  { icon: UserPlus,      color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40',       text: 'Kunle just opened a store',                sub: 'Electronics · Abuja' },
]

export function LiveActivityTicker() {
  const [index, setIndex]     = useState(0)
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Start after 4 s so it doesn't clash with hero entrance
    const boot = setTimeout(() => setVisible(true), 4000)
    return () => clearTimeout(boot)
  }, [])

  useEffect(() => {
    if (!visible || dismissed) return
    const id = setInterval(() => {
      // Brief hide then show next
      setVisible(false)
      setTimeout(() => {
        setIndex(i => (i + 1) % EVENTS.length)
        setVisible(true)
      }, 400)
    }, 5000)
    return () => clearInterval(id)
  }, [visible, dismissed])

  if (dismissed) return null

  const ev = EVENTS[index]
  const Icon = ev.icon

  return (
    <LazyMotion features={domAnimation} strict>
      <div
        className="fixed bottom-24 left-4 lg:bottom-6 z-50 pointer-events-none hidden sm:block"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence mode="wait">
          {visible && (
            <m.div
              key={index}
              className="pointer-events-auto flex items-center gap-3 bg-card border border-border shadow-2xl shadow-black/10 rounded-2xl px-4 py-3 max-w-[280px] sm:max-w-[320px]"
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${ev.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground leading-snug truncate">{ev.text}</p>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">{ev.sub}</p>
              </div>
              <button
                onClick={() => setDismissed(true)}
                className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-1"
                aria-label="Dismiss notification"
              >
                <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M1 1l8 8M9 1L1 9" />
                </svg>
              </button>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </LazyMotion>
  )
}
