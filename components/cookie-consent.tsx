'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, X, Check, Settings2 } from 'lucide-react'

type Prefs = { necessary: true; analytics: boolean; marketing: boolean }

const DEFAULT: Prefs = { necessary: true, analytics: true, marketing: false }
const KEY = 'vx_cookie_consent_v1'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY)
      if (!stored) {
        setTimeout(() => setVisible(true), 1200)
      }
    } catch {}
  }, [])

  function save(p: Prefs) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...p, timestamp: Date.now() }))
    } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9998] p-3 sm:p-4 lg:p-6 pb-28 lg:pb-6 pointer-events-none">
      <div
        className="pointer-events-auto max-w-2xl mx-auto lg:mx-0 lg:ml-auto bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden animate-in slide-in-from-bottom-4 duration-500"
      >
        {/* Header */}
        <div className="flex items-start gap-3 p-4 sm:p-5 pb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Cookie className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-sm text-foreground">We use cookies 🍪</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              VendoorX uses cookies to improve your experience, analyse traffic, and personalise content.
              {' '}
              <Link href="/cookies" className="text-primary hover:underline font-semibold">
                Cookie Policy
              </Link>
            </p>
          </div>
          <button
            onClick={() => save({ necessary: true, analytics: false, marketing: false })}
            className="flex-shrink-0 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-muted transition-colors text-gray-400"
            aria-label="Decline all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Expanded preferences */}
        {expanded && (
          <div className="px-4 sm:px-5 pb-3 space-y-2 border-t border-gray-100 dark:border-border pt-3">
            {[
              {
                key: 'necessary' as const,
                label: 'Necessary',
                desc: 'Required for the site to function. Cannot be disabled.',
                locked: true,
              },
              {
                key: 'analytics' as const,
                label: 'Analytics',
                desc: 'Help us understand how you use VendoorX.',
                locked: false,
              },
              {
                key: 'marketing' as const,
                label: 'Marketing',
                desc: 'Personalised ads and content based on your interests.',
                locked: false,
              },
            ].map(({ key, label, desc, locked }) => (
              <div key={key} className="flex items-center justify-between gap-3 py-1.5">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground">{label}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug">{desc}</p>
                </div>
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => !locked && setPrefs(p => ({ ...p, [key]: !p[key] }))}
                  className={`relative flex-shrink-0 w-10 h-5.5 h-[22px] rounded-full transition-colors duration-200 ${
                    prefs[key]
                      ? 'bg-primary'
                      : 'bg-gray-200 dark:bg-muted'
                  } ${locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  aria-checked={prefs[key]}
                  role="switch"
                >
                  <span
                    className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-all duration-200 ${
                      prefs[key] ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-2 p-4 sm:p-5 pt-3 border-t border-gray-100 dark:border-border">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors w-full sm:w-auto"
          >
            <Settings2 className="w-3.5 h-3.5" />
            {expanded ? 'Hide preferences' : 'Customise'}
          </button>
          <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
            <button
              onClick={() => save({ necessary: true, analytics: false, marketing: false })}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-border text-gray-600 dark:text-muted-foreground hover:bg-gray-50 dark:hover:bg-muted transition-colors"
            >
              Reject all
            </button>
            {expanded ? (
              <button
                onClick={() => save(prefs)}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-xl bg-gray-900 dark:bg-foreground text-white dark:text-background hover:opacity-90 transition-opacity"
              >
                Save preferences
              </button>
            ) : (
              <button
                onClick={() => save({ necessary: true, analytics: true, marketing: true })}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:opacity-90 transition-opacity"
              >
                <Check className="w-3.5 h-3.5" />
                Accept all
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
