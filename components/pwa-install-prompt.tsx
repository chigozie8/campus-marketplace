'use client'

import { useEffect, useState, useCallback } from 'react'
import { X, Smartphone, Share, Zap, Wifi, ShieldCheck, Star } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Platform = 'android' | 'ios' | 'other'
const DISMISSED_KEY = 'pwa-dismissed-v2'
const SHOWN_KEY     = 'pwa-shown-v2'

/* ─── tiny helpers ────────────────────────────────────────────────────────── */
function Stars() {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <svg key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function AppIcon({ size = 64 }: { size?: number }) {
  return (
    <div
      className="rounded-[22%] flex items-center justify-center flex-shrink-0 shadow-2xl"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #0a0a0a 100%)',
      }}
    >
      <span
        className="font-black tracking-tight leading-none select-none"
        style={{ color: '#fff', fontSize: size * 0.3 }}
      >
        V<span style={{ color: '#4ade80' }}>X</span>
      </span>
    </div>
  )
}

/* ─── iOS Safari share icon (SVG) ────────────────────────────────────────── */
function SafariShareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
    </svg>
  )
}

export function PwaInstallPrompt() {
  const [platform, setPlatform]           = useState<Platform>('other')
  const [deferredPrompt, setDeferred]     = useState<BeforeInstallPromptEvent | null>(null)
  const [bannerVisible, setBannerVisible] = useState(false)
  const [modalOpen, setModalOpen]         = useState(false)
  const [installing, setInstalling]       = useState(false)
  const [installed, setInstalled]         = useState(false)

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true)
    if (isStandalone) return
    if (localStorage.getItem(DISMISSED_KEY)) return

    const ua = navigator.userAgent
    const isIos =
      /iphone|ipad|ipod/i.test(ua) &&
      !/crios/i.test(ua) &&
      !/fxios/i.test(ua) &&
      !/chrome/i.test(ua)

    if (isIos) {
      setPlatform('ios')
      const t = setTimeout(() => setBannerVisible(true), 2500)
      if (!localStorage.getItem(SHOWN_KEY)) {
        const m = setTimeout(() => { setModalOpen(true); localStorage.setItem(SHOWN_KEY, '1') }, 5000)
        return () => { clearTimeout(t); clearTimeout(m) }
      }
      return () => clearTimeout(t)
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    setPlatform('android')

    const t = setTimeout(() => setBannerVisible(true), 2500)
    let m: ReturnType<typeof setTimeout>
    if (!localStorage.getItem(SHOWN_KEY)) {
      m = setTimeout(() => { setModalOpen(true); localStorage.setItem(SHOWN_KEY, '1') }, 5500)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      clearTimeout(t)
      clearTimeout(m!)
    }
  }, [])

  const dismiss = useCallback(() => {
    setModalOpen(false)
    setBannerVisible(false)
    localStorage.setItem(DISMISSED_KEY, '1')
  }, [])

  const closeModal = useCallback(() => setModalOpen(false), [])

  const install = useCallback(async () => {
    if (!deferredPrompt) {
      setModalOpen(true)
      return
    }
    setInstalling(true)
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setInstalling(false)
    if (outcome === 'accepted') {
      setInstalled(true)
      setTimeout(() => {
        setModalOpen(false)
        setBannerVisible(false)
        localStorage.setItem(DISMISSED_KEY, '1')
      }, 1500)
    }
    setDeferred(null)
  }, [deferredPrompt])

  if (platform === 'other' && !bannerVisible) return null
  if (!bannerVisible && !modalOpen) return null

  return (
    <>
      {/* ── Floating banner ─────────────────────────────────────────────────── */}
      {bannerVisible && !modalOpen && (
        <div
          className={`fixed z-40 left-3 right-3 sm:left-auto sm:right-6 sm:w-80 bottom-[88px] sm:bottom-6 transition-all duration-500 ${bannerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
        >
          <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-black/30 border border-white/10">
            {/* gradient bg */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#16a34a] via-[#15803d] to-[#052e16]" />
            {/* shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_ease-in-out_infinite]" style={{ backgroundSize: '200% 100%' }} />

            <div className="relative flex items-center gap-3 p-3 pr-4">
              <AppIcon size={48} />

              <div className="flex-1 min-w-0">
                <p className="text-white font-black text-sm leading-tight">Get the VendoorX App</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Stars />
                  <span className="text-white/60 text-[10px] font-medium">50K+ students</span>
                </div>
                <p className="text-white/70 text-[10px] mt-0.5 leading-snug">Free · No app store needed</p>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <button
                  onClick={dismiss}
                  className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="w-3 h-3 text-white/70" />
                </button>
                <button
                  onClick={() => setModalOpen(true)}
                  className="bg-white text-[#16a34a] font-black text-xs px-3 py-1.5 rounded-xl hover:bg-green-50 active:scale-95 transition-all shadow-lg"
                >
                  Install
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal overlay ───────────────────────────────────────────────────── */}
      {modalOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
            style={{ animation: 'fadeIn 0.25s ease' }}
            onClick={closeModal}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Install VendoorX"
            className="fixed z-50 inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-6"
            style={{ animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}
          >
            <div className="w-full sm:max-w-sm bg-white dark:bg-zinc-900 rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-[0_-8px_80px_rgba(0,0,0,0.35)] sm:shadow-2xl">

              {/* ── Hero gradient header ──────────────────────────────────── */}
              <div className="relative overflow-hidden px-6 pt-7 pb-6" style={{ background: 'linear-gradient(145deg, #052e16 0%, #14532d 40%, #166534 100%)' }}>
                {/* decorative blobs */}
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 blur-3xl" style={{ background: '#4ade80', transform: 'translate(30%,-30%)' }} />
                <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10 blur-2xl" style={{ background: '#22c55e', transform: 'translate(-30%,30%)' }} />

                {/* drag handle on mobile */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-white/20 rounded-full sm:hidden" />

                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-white/80" />
                </button>

                <div className="flex items-center gap-4">
                  <AppIcon size={68} />
                  <div>
                    <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-0.5">Download Free</p>
                    <h2 className="text-white font-black text-2xl tracking-tight leading-none">VendoorX</h2>
                    <p className="text-green-300/80 text-sm font-medium mt-0.5">Campus Marketplace</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Stars />
                      <span className="text-white/50 text-xs font-medium">4.9 · 50K+ users</span>
                    </div>
                  </div>
                </div>

                {/* social proof strip */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    { n: '50K+', label: 'Students' },
                    { n: '100+', label: 'Campuses' },
                    { n: '₦0', label: 'Platform fee' },
                  ].map(({ n, label }) => (
                    <div key={label} className="bg-white/10 rounded-xl py-2 text-center border border-white/5">
                      <p className="text-white font-black text-base leading-none">{n}</p>
                      <p className="text-white/50 text-[10px] mt-0.5 font-medium">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Body ─────────────────────────────────────────────────── */}
              <div className="px-5 pt-5 pb-6">

                {/* feature chips */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {[
                    { Icon: Zap,         label: 'Lightning Fast',  sub: '< 0.3s launch',    color: 'from-amber-400/20 to-amber-400/5', icon: 'text-amber-500' },
                    { Icon: Wifi,        label: 'Works Offline',   sub: 'Browse anywhere',   color: 'from-blue-400/20 to-blue-400/5',  icon: 'text-blue-500'  },
                    { Icon: ShieldCheck, label: 'Secure',          sub: 'SSL encrypted',     color: 'from-green-400/20 to-green-400/5', icon: 'text-green-600' },
                  ].map(({ Icon, label, sub, color, icon }) => (
                    <div key={label} className={`flex flex-col items-center gap-1.5 bg-gradient-to-b ${color} rounded-2xl p-3 border border-zinc-100 dark:border-zinc-800`}>
                      <Icon className={`w-4.5 h-4.5 ${icon}`} />
                      <span className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200 text-center leading-tight">{label}</span>
                      <span className="text-[9px] text-zinc-400 text-center leading-tight">{sub}</span>
                    </div>
                  ))}
                </div>

                {platform === 'ios' ? (
                  /* ── iOS steps ──────────────────────────────────────── */
                  <div className="space-y-2 mb-4">
                    <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest text-center mb-3">2 quick steps to install</p>

                    {[
                      {
                        n: '1',
                        icon: <SafariShareIcon />,
                        title: 'Tap the Share button',
                        desc: 'Find it in your Safari toolbar',
                      },
                      {
                        n: '2',
                        icon: <Smartphone className="w-5 h-5 text-[#16a34a]" />,
                        title: '"Add to Home Screen"',
                        desc: 'Scroll down and tap it',
                      },
                    ].map(step => (
                      <div key={step.n} className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 rounded-2xl px-4 py-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#16a34a] to-[#15803d] flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-900/30">
                          <span className="text-white text-xs font-black">{step.n}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{step.title}</p>
                          <p className="text-xs text-zinc-400 mt-0.5">{step.desc}</p>
                        </div>
                        {step.icon}
                      </div>
                    ))}

                    {/* iOS tip */}
                    <div className="flex items-start gap-2 mt-3 px-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-zinc-400 leading-snug">
                        Works exactly like a native iPhone app — no App Store needed!
                      </p>
                    </div>
                  </div>
                ) : (
                  /* ── Android install button ─────────────────────────── */
                  <button
                    onClick={install}
                    disabled={installing || installed}
                    className="relative w-full overflow-hidden rounded-2xl text-white font-black text-base flex items-center justify-center gap-2.5 py-4 transition-all active:scale-[0.97] disabled:opacity-70 shadow-xl shadow-green-900/30 mb-1"
                    style={{ background: installed ? '#15803d' : 'linear-gradient(135deg, #16a34a 0%, #15803d 60%, #052e16 100%)' }}
                  >
                    {/* shimmer on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />

                    {installing ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Installing…
                      </>
                    ) : installed ? (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                        Installed! 🎉
                      </>
                    ) : (
                      <>
                        {/* phone + arrow down icon */}
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                          <rect x="5" y="2" width="14" height="20" rx="2"/>
                          <path d="M12 12v4m0 0l-2-2m2 2l2-2"/>
                          <circle cx="12" cy="18.5" r="0.5" fill="currentColor"/>
                        </svg>
                        Add to Home Screen — Free
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={dismiss}
                  className="w-full py-2.5 text-sm font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors mt-1"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(60px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes shimmer { 0%,100% { transform: translateX(-100%) } 50% { transform: translateX(100%) } }
      `}</style>
    </>
  )
}
