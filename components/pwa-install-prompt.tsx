'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { Download, Smartphone, Share } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type PromptState = 'hidden' | 'banner' | 'ios'

const CANCELLED_KEY = 'pwa-cancelled'

export function PwaInstallPrompt() {
  const pathname = usePathname()
  const [state, setState] = useState<PromptState>('hidden')
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installing, setInstalling] = useState(false)
  const [visible, setVisible] = useState(false)

  const isHomePage = pathname === '/'

  useEffect(() => {
    if (!isHomePage) {
      setState('hidden')
      setVisible(false)
      return
    }

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator &&
        (window.navigator as { standalone?: boolean }).standalone === true)
    if (isStandalone) return

    if (sessionStorage.getItem(CANCELLED_KEY)) return

    const ua = window.navigator.userAgent
    const isIos =
      /iphone|ipad|ipod/i.test(ua) &&
      !/crios/i.test(ua) &&
      !/fxios/i.test(ua) &&
      !/chrome/i.test(ua)

    if (isIos) {
      const t = setTimeout(() => { setState('ios'); setVisible(true) }, 3000)
      return () => clearTimeout(t)
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setState('banner')
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    const t = setTimeout(() => {
      setState((prev) => {
        if (prev === 'hidden') { setVisible(true); return 'banner' }
        return prev
      })
    }, 3000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      clearTimeout(t)
    }
  }, [isHomePage])

  const cancel = useCallback(() => {
    setVisible(false)
    setTimeout(() => setState('hidden'), 300)
    sessionStorage.setItem(CANCELLED_KEY, '1')
  }, [])

  const install = useCallback(async () => {
    if (deferredPrompt) {
      setInstalling(true)
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      setInstalling(false)
      if (outcome === 'accepted') cancel()
      setDeferredPrompt(null)
    }
  }, [deferredPrompt, cancel])

  if (state === 'hidden') return null

  return (
    /* Floating card — bottom-right on desktop, bottom-center on mobile */
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Install VendoorX app"
      className={`fixed z-50 bottom-20 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] max-w-sm transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <div className="relative bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl shadow-black/20 border border-zinc-100 dark:border-zinc-800 overflow-hidden">

        {/* Top accent stripe */}
        <div className="h-1 w-full bg-gradient-to-r from-[#16a34a] via-[#22c55e] to-[#16a34a]" />

        <div className="p-4 sm:p-5">
          {/* Header row */}
          <div className="flex items-start gap-3">
            {/* App icon */}
            <div className="w-12 h-12 rounded-2xl bg-[#0a0a0a] flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-white text-sm font-black tracking-tight leading-none">
                V<span className="text-[#16a34a]">X</span>
              </span>
            </div>

            {/* Title */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-sm font-black text-zinc-900 dark:text-white tracking-tight">
                  Get the VendoorX App
                </h2>
                <span className="inline-flex items-center bg-[#16a34a]/10 text-[#16a34a] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  FREE
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                Instant access &bull; Works offline &bull; No App Store needed
              </p>
            </div>

            {/* Dismiss */}
            <button
              onClick={cancel}
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              aria-label="Dismiss"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {/* Divider */}
          <div className="my-3 border-t border-zinc-100 dark:border-zinc-800" />

          {state === 'ios' ? (
            /* iOS steps */
            <div className="space-y-2.5">
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Install in 2 steps</p>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#0a0a0a] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[10px] font-black">1</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <Share className="w-3.5 h-3.5 text-[#16a34a] flex-shrink-0" />
                  Tap <strong>Share</strong> in Safari
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#0a0a0a] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[10px] font-black">2</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <Smartphone className="w-3.5 h-3.5 text-[#16a34a] flex-shrink-0" />
                  Select <strong>&ldquo;Add to Home Screen&rdquo;</strong>
                </div>
              </div>
            </div>
          ) : (
            /* Install button */
            <button
              onClick={install}
              disabled={installing}
              className="w-full h-10 rounded-xl bg-[#0a0a0a] hover:bg-zinc-800 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all duration-150 shadow-md shadow-black/20 disabled:opacity-60"
            >
              {installing ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <Download className="w-4 h-4 text-[#16a34a]" />
              )}
              {installing ? 'Installing…' : 'Install — Free'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
