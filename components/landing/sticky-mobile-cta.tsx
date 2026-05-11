'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

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
      <div className="flex items-center gap-2 rounded-full bg-[#128C7E] text-white shadow-2xl shadow-[#128C7E]/40 pl-5 pr-2 py-2">
        <Link href="/auth/sign-up" className="flex-1 flex items-center justify-between gap-3 text-sm font-bold">
          <span className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.971 1.203l-.36.214-.373-.058c-1.25-.196-2.458-.666-3.426-1.43l-.04-.032-.046.016A9.884 9.884 0 002.25 12c0 5.514 4.486 10 10 10 5.514 0 10-4.486 10-10S17.764 2 12.25 2c-.508 0-1.01.041-1.502.122l-.064.011-.064.011z" />
            </svg>
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
