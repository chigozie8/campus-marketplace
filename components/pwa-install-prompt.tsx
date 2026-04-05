'use client'

import { useEffect, useState, useCallback } from 'react'
import { X, Download, Smartphone, Share } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type PromptState = 'hidden' | 'banner' | 'ios' | 'mini'

const DISMISSED_KEY = 'pwa-prompt-dismissed-until'
const VERSION_KEY = 'pwa-prompt-version'
const CURRENT_VERSION = '2'
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function isDismissed(): boolean {
  try {
    const val = localStorage.getItem(DISMISSED_KEY)
    if (!val) return false
    const expiry = Number(val)
    // Guard against corrupted / NaN values
    if (isNaN(expiry)) {
      localStorage.removeItem(DISMISSED_KEY)
      return false
    }
    return Date.now() < expiry
  } catch {
    return false
  }
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISSED_KEY, String(Date.now() + DISMISS_DURATION_MS))
  } catch {}
}

export function PwaInstallPrompt() {
  const [state, setState] = useState<PromptState>('hidden')
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Clear stale dismiss state on new version
    try {
      if (localStorage.getItem(VERSION_KEY) !== CURRENT_VERSION) {
        localStorage.removeItem(DISMISSED_KEY)
        localStorage.setItem(VERSION_KEY, CURRENT_VERSION)
      }
    } catch {}

    // Already installed as standalone — no need to prompt
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator &&
        (window.navigator as { standalone?: boolean }).standalone === true)

    if (isStandalone) return

    // Show mini pill if previously dismissed
    if (isDismissed()) {
      setState('mini')
      return
    }

    // iOS Safari — no beforeinstallprompt, show manual instructions
    const ua = window.navigator.userAgent
    const isIos =
      /iphone|ipad|ipod/i.test(ua) &&
      !/crios/i.test(ua) &&
      !/fxios/i.test(ua) &&
      !/chrome/i.test(ua)

    if (isIos) {
      const t = setTimeout(() => setState('ios'), 1500)
      return () => clearTimeout(t)
    }

    // Chrome / Android — listen for native beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setState('banner')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // Fallback: show banner after 1.5s even if beforeinstallprompt never fires
    // (covers browsers that don't support it or already met install criteria)
    const fallbackTimer = setTimeout(() => {
      setState((prev) => (prev === 'hidden' ? 'banner' : prev))
    }, 1500)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      clearTimeout(fallbackTimer)
    }
  }, [])

  const dismiss = useCallback(() => {
    markDismissed()
    setState('mini')
  }, [])

  const install = useCallback(async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setState('hidden')
      }
      setDeferredPrompt(null)
    } else {
      // No native prompt available — still dismiss the banner
      setState('hidden')
    }
  }, [deferredPrompt])

  if (state === 'hidden') return null

  // Mini persistent pill — shown after dismissal
  if (state === 'mini') {
    return (
      <button
        onClick={() => setState('banner')}
        className="fixed bottom-28 md:bottom-8 left-4 z-[60] flex items-center gap-2 bg-[#0a0a0a] text-white text-[12px] font-bold px-3 py-2 rounded-full shadow-lg hover:bg-[#1a1a1a] active:scale-95 transition-all animate-in slide-in-from-left-4 duration-300"
        aria-label="Install VendoorX app"
      >
        <Download className="w-3.5 h-3.5 text-[#16a34a]" />
        Install App
      </button>
    )
  }

  return (
    <div
      role="dialog"
      aria-label="Install VendoorX app"
      className="fixed bottom-24 lg:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-[380px] z-[60] animate-in slide-in-from-bottom-6 duration-500 ease-out"
    >
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Brand accent strip */}
        <div className="h-1 w-full bg-[#16a34a]" />

        <div className="p-5">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-[#0a0a0a] flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-white text-lg font-black tracking-tight leading-none">
                V<span className="text-[#16a34a]">X</span>
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-black text-[15px] text-zinc-900 dark:text-white leading-tight">
                    Install VendoorX
                  </p>
                  <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                    Add to your home screen — fast access, works offline.
                  </p>
                </div>
                <button
                  onClick={dismiss}
                  className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors flex-shrink-0 p-1 -mr-1 -mt-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {state === 'ios' ? (
                <div className="mt-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3 space-y-2">
                  <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    How to install on iOS
                  </p>
                  <div className="flex items-center gap-2 text-[12px] text-zinc-700 dark:text-zinc-300">
                    <Share className="w-4 h-4 text-[#16a34a] flex-shrink-0" />
                    <span>Tap the <strong>Share</strong> button in Safari</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-zinc-700 dark:text-zinc-300">
                    <Smartphone className="w-4 h-4 text-[#16a34a] flex-shrink-0" />
                    <span>Select <strong>&ldquo;Add to Home Screen&rdquo;</strong></span>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    onClick={install}
                    className="flex-1 gap-1.5 h-9 text-[13px] font-bold bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white border-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Install App
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={dismiss}
                    className="h-9 text-[13px] px-3 text-zinc-500"
                  >
                    Not now
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
