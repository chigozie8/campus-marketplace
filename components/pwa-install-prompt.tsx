'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { X, Download, Smartphone, Share, Zap, ShieldCheck, Wifi } from 'lucide-react'

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

  // Only show on home page
  const isHomePage = pathname === '/'

  useEffect(() => {
    // Only show on home page
    if (!isHomePage) {
      setState('hidden')
      return
    }

    // Already installed — skip
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator &&
        (window.navigator as { standalone?: boolean }).standalone === true)
    if (isStandalone) return

    // User explicitly cancelled this session — skip
    if (sessionStorage.getItem(CANCELLED_KEY)) return

    // Detect iOS Safari
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

    // Chrome / Android — capture native prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setState('banner')
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // Always show after 1.5s even without native event
    const t = setTimeout(() => {
      setState((prev) => (prev === 'hidden' ? 'banner' : prev))
    }, 1500)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      clearTimeout(t)
    }
  }, [isHomePage])

  // Cancel — only hides for this session, shows again on next visit
  const cancel = useCallback(() => {
    sessionStorage.setItem(CANCELLED_KEY, '1')
    setState('hidden')
  }, [])

  const install = useCallback(async () => {
    if (deferredPrompt) {
      setInstalling(true)
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      setInstalling(false)
      if (outcome === 'accepted') {
        setState('hidden')
      }
      setDeferredPrompt(null)
    }
  }, [deferredPrompt])

  if (state === 'hidden') return null

  const features = [
    { icon: Zap, label: 'Instant access', sub: 'Opens in 0.3s' },
    { icon: Wifi, label: 'Works offline', sub: 'Browse anytime' },
    { icon: ShieldCheck, label: 'Secure & private', sub: 'SSL encrypted' },
  ]

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[58] bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300"
        onClick={cancel}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Install VendoorX"
        className="fixed bottom-0 left-0 right-0 z-[59] animate-in slide-in-from-bottom-full duration-500 ease-out"
      >
        <div className="bg-white dark:bg-zinc-950 rounded-t-[32px] shadow-2xl overflow-hidden max-w-lg mx-auto">

          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700" />
          </div>

          {/* Close button */}
          <div className="flex justify-end px-5 pt-1">
            <button
              onClick={cancel}
              className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
              aria-label="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-6 pb-8 pt-2">
            {/* App identity */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-[#0a0a0a] flex items-center justify-center shadow-xl flex-shrink-0 ring-4 ring-[#16a34a]/20">
                <span className="text-white text-xl font-black tracking-tight leading-none">
                  V<span className="text-[#16a34a]">X</span>
                </span>
              </div>
              <div>
                <h2 className="text-xl font-black text-zinc-900 dark:text-white leading-tight tracking-tight">
                  VendoorX
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                  Campus Marketplace
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} className="w-3 h-3 text-[#16a34a] fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-[11px] text-zinc-400 ml-1 font-medium">4.9 • 50K+ users</span>
                </div>
              </div>
            </div>

            {/* Feature pills */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {features.map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-3 border border-zinc-100 dark:border-zinc-800"
                >
                  <div className="w-8 h-8 rounded-full bg-[#16a34a]/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#16a34a]" />
                  </div>
                  <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 text-center leading-tight">{label}</span>
                  <span className="text-[10px] text-zinc-400 text-center">{sub}</span>
                </div>
              ))}
            </div>

            {state === 'ios' ? (
              /* iOS instructions */
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800 mb-4">
                <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-3">
                  How to install on iOS
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#0a0a0a] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-[10px] font-black">1</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Share className="w-4 h-4 text-[#16a34a] flex-shrink-0" />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        Tap the <strong>Share</strong> button in Safari
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#0a0a0a] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-[10px] font-black">2</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-[#16a34a] flex-shrink-0" />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        Select <strong>&ldquo;Add to Home Screen&rdquo;</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Install CTA */
              <button
                onClick={install}
                disabled={installing}
                className="w-full h-14 rounded-2xl bg-[#0a0a0a] hover:bg-[#1a1a1a] active:scale-[0.98] text-white font-black text-base flex items-center justify-center gap-2.5 transition-all duration-200 shadow-lg shadow-black/20 disabled:opacity-70"
              >
                {installing ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <Download className="w-5 h-5 text-[#16a34a]" />
                )}
                {installing ? 'Installing…' : 'Add to Home Screen — Free'}
              </button>
            )}

            <p className="text-center text-[11px] text-zinc-400 mt-3 leading-relaxed">
              No App Store needed &bull; Free forever &bull; Works on all devices
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
