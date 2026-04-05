'use client'

import { useEffect, useState } from 'react'
import { X, Download, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Don't show if already installed (standalone) or already dismissed in this session
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)

    const wasDismissed = sessionStorage.getItem('pwa-prompt-dismissed')

    if (isStandalone || wasDismissed) return

    // iOS detection — Safari doesn't fire beforeinstallprompt
    const ua = window.navigator.userAgent
    const ios = /iphone|ipad|ipod/i.test(ua) && !/crios/i.test(ua) && !/fxios/i.test(ua)

    if (ios) {
      setIsIos(true)
      // Show iOS tip after 3s
      const t = setTimeout(() => setVisible(true), 3000)
      return () => clearTimeout(t)
    }

    // Android / Chrome — listen for native beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // In development, show the prompt after 5s so it's always testable
    let devTimer: ReturnType<typeof setTimeout> | undefined
    if (process.env.NODE_ENV === 'development') {
      devTimer = setTimeout(() => setVisible(true), 5000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      if (devTimer) clearTimeout(devTimer)
    }
  }, [])

  function dismiss() {
    sessionStorage.setItem('pwa-prompt-dismissed', '1')
    setVisible(false)
    setDismissed(true)
  }

  async function install() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setVisible(false)
    }
    setDeferredPrompt(null)
  }

  if (!visible || dismissed) return null

  return (
    <div
      role="dialog"
      aria-label="Install VendoorX app"
      className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-[360px] z-50 animate-in slide-in-from-bottom-4 duration-300"
    >
      <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Top accent strip */}
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #25D366 0%, oklch(0.45 0.22 155) 100%)' }} />

        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* App icon */}
            <div className="w-12 h-12 rounded-2xl hero-gradient flex items-center justify-center shadow-md flex-shrink-0">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-sm text-foreground leading-tight">Install VendoorX</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                    Add to your home screen for fast access — no App Store needed.
                  </p>
                </div>
                <button
                  onClick={dismiss}
                  className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-0.5"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isIos ? (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/60 rounded-xl px-3 py-2">
                  {/* Share icon */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 text-primary">
                    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Tap <strong>Share</strong> then <strong>&ldquo;Add to Home Screen&rdquo;</strong></span>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={install}
                  className="mt-3 w-full gap-2 h-8 text-xs font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  Install App
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
