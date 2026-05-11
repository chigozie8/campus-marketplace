'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X, MessageCircle } from 'lucide-react'

const STORAGE_KEY = 'vendoorx_mobile_cta_dismissed_v1'

/**
 * Bottom-fixed "Get started free" pill, mobile-only, dismissible.
 * Catches scroll-deep visitors who passed the hero CTA. Hidden on:
 *  - desktop (md+)
 *  - signed-in users
 *  - users who explicitly dismissed it (remembered in localStorage)
 *  - first ~400px of scroll (so it doesn't fight with the hero CTA)
 */
export function StickyMobileCta({ isAuthed }: { isAuthed: boolean }) {
  const [dismissed, setDismissed] = useState(true) // start hidden to avoid hydration flash
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (isAuthed) return
    const persisted = typeof window !== 'undefined' && window.localStorage.getItem(STORAGE_KEY) === '1'
    setDismissed(persisted)
    function onScroll() { setScrolled(window.scrollY > 400) }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isAuthed])

  if (isAuthed || dismissed || !scrolled) return null

  return (
    <div className="md:hidden fixed bottom-3 inset-x-3 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-2 rounded-full bg-[#25D366] text-white shadow-2xl shadow-[#25D366]/25 pl-5 pr-2 py-2">
        <Link href="/auth/sign-up" className="flex-1 flex items-center justify-between gap-3 text-sm font-bold">
          <span className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Start Selling Now
          </span>
        </Link>
        <button
          type="button"
          onClick={() => {
            window.localStorage.setItem(STORAGE_KEY, '1')
            setDismissed(true)
          }}
          aria-label="Dismiss"
          className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
