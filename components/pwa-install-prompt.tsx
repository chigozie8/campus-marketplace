'use client'

import { useEffect, useState, useCallback } from 'react'
import { Download, Smartphone, Share, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Platform = 'android' | 'ios' | 'other'
const DISMISSED_KEY = 'pwa-dismissed'

export function PwaInstallPrompt() {
  const [platform, setPlatform] = useState<Platform>('other')
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [chipVisible, setChipVisible] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    // Already installed as standalone — never show
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator &&
        (window.navigator as { standalone?: boolean }).standalone === true)
    if (isStandalone) return

    // User already permanently dismissed
    if (localStorage.getItem(DISMISSED_KEY)) return

    const ua = window.navigator.userAgent
    const isIos =
      /iphone|ipad|ipod/i.test(ua) &&
      !/crios/i.test(ua) &&
      !/fxios/i.test(ua) &&
      !/chrome/i.test(ua)

    if (isIos) {
      setPlatform('ios')
      // Always show chip on every load/refresh for iOS
      const t = setTimeout(() => setChipVisible(true), 1500)
      return () => clearTimeout(t)
    }

    // Android/Chrome — capture native install prompt if available
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setPlatform('android')
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // Always show the chip on every load/refresh regardless of whether
    // beforeinstallprompt fires (it only fires once per browser session)
    setPlatform('android')
    const t = setTimeout(() => {
      setChipVisible(true)
    }, 1500)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      clearTimeout(t)
    }
  }, [])

  // Permanently dismiss — won't show again until localStorage is cleared
  const dismiss = useCallback(() => {
    setModalOpen(false)
    setTimeout(() => setChipVisible(false), 200)
    localStorage.setItem(DISMISSED_KEY, '1')
  }, [])

  // Close modal but keep chip visible (just cancel the modal)
  const closeModal = useCallback(() => {
    setModalOpen(false)
  }, [])

  const install = useCallback(async () => {
    if (deferredPrompt) {
      setInstalling(true)
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      setInstalling(false)
      if (outcome === 'accepted') {
        setModalOpen(false)
        setChipVisible(false)
        localStorage.setItem(DISMISSED_KEY, '1')
      }
      setDeferredPrompt(null)
    }
  }, [deferredPrompt])

  if (!chipVisible) return null

  return (
    <>
      {/* ── Persistent mini chip — always visible, bottom-left above nav ── */}
      <button
        onClick={() => setModalOpen(true)}
        aria-label="Install VendoorX app"
        className={`fixed z-40 bottom-[84px] left-4 sm:bottom-6 sm:left-6 flex items-center gap-2 bg-[#0a0a0a] dark:bg-zinc-800 text-white pl-2.5 pr-3.5 py-2 rounded-full shadow-xl shadow-black/25 hover:scale-105 active:scale-95 transition-all duration-200 ${
          chipVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        {/* Pulsing green dot */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16a34a]" />
        </span>
        <span className="text-xs font-bold tracking-tight">Install App</span>
        <Download className="w-3.5 h-3.5 text-[#16a34a]" />
      </button>

      {/* ── Modal overlay ── */}
      {modalOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={closeModal}
            aria-hidden="true"
          />

          {/* Modal card — centred on desktop, bottom sheet on mobile */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Install VendoorX"
            className="fixed z-50 left-0 right-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4 animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300"
          >
            <div className="bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md shadow-2xl overflow-hidden">

              {/* Green accent bar */}
              <div className="h-1.5 bg-gradient-to-r from-[#16a34a] via-[#22c55e] to-[#16a34a]" />

              <div className="p-6">
                {/* Close (X) button */}
                <div className="flex justify-end -mt-1 -mr-1 mb-3">
                  <button
                    onClick={closeModal}
                    className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* App identity */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#0a0a0a] flex items-center justify-center shadow-xl flex-shrink-0">
                    <span className="text-white text-xl font-black tracking-tight leading-none">
                      V<span className="text-[#16a34a]">X</span>
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
                      VendoorX
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Campus Marketplace</p>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1,2,3,4,5].map(s => (
                        <svg key={s} className="w-3 h-3 fill-[#16a34a]" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-[11px] text-zinc-400 ml-1 font-medium">4.9 &bull; 50K+ users</span>
                    </div>
                  </div>
                </div>

                {/* Feature pills */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {[
                    { emoji: '⚡', label: 'Instant', sub: 'Opens in 0.3s' },
                    { emoji: '📶', label: 'Offline', sub: 'Works anywhere' },
                    { emoji: '🔒', label: 'Secure', sub: 'SSL encrypted' },
                  ].map(({ emoji, label, sub }) => (
                    <div key={label} className="flex flex-col items-center gap-1 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl p-3 border border-zinc-100 dark:border-zinc-700/50">
                      <span className="text-lg leading-none">{emoji}</span>
                      <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">{label}</span>
                      <span className="text-[10px] text-zinc-400 text-center leading-tight">{sub}</span>
                    </div>
                  ))}
                </div>

                {platform === 'ios' ? (
                  /* iOS manual steps */
                  <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-700/50 mb-5">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Install in 2 quick steps</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#0a0a0a] flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-[10px] font-black">1</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                          <Share className="w-4 h-4 text-[#16a34a] flex-shrink-0" />
                          Tap <strong className="mx-1">Share</strong> in Safari
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#0a0a0a] flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-[10px] font-black">2</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                          <Smartphone className="w-4 h-4 text-[#16a34a] flex-shrink-0" />
                          Select <strong className="mx-1">&ldquo;Add to Home Screen&rdquo;</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Android / Chrome install CTA */
                  <button
                    onClick={install}
                    disabled={installing}
                    className="w-full h-13 rounded-2xl bg-[#0a0a0a] hover:bg-zinc-800 active:scale-[0.98] text-white font-black text-base flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-black/20 disabled:opacity-60 mb-3 py-3.5"
                  >
                    {installing ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    ) : (
                      <Download className="w-5 h-5 text-[#16a34a]" />
                    )}
                    {installing ? 'Installing…' : 'Install — Free'}
                  </button>
                )}

                {/* No thanks — permanently dismisses */}
                <button
                  onClick={dismiss}
                  className="w-full py-2.5 text-sm font-semibold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                >
                  No thanks, continue in browser
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
