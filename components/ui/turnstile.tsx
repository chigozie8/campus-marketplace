'use client'

import { useEffect, useRef, useCallback } from 'react'
import { ShieldCheck } from 'lucide-react'

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string
      remove: (id: string) => void
      reset: (id: string) => void
    }
    onTurnstileLoad?: () => void
  }
}

const TEST_SITE_KEY = '1x00000000000000000000AA'

interface Props {
  onVerify: (token: string) => void
  onExpire?: () => void
  onError?: () => void
  theme?: 'light' | 'dark' | 'auto'
}

export function TurnstileWidget({ onVerify, onExpire, onError, theme = 'auto' }: Props) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || TEST_SITE_KEY
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile) return
    if (widgetIdRef.current) {
      try { window.turnstile.remove(widgetIdRef.current) } catch { /* ignore */ }
    }
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onVerify,
      'expired-callback': onExpire ?? (() => {}),
      'error-callback': onError ?? (() => {}),
      theme,
      size: 'flexible',
    })
  }, [siteKey, onVerify, onExpire, onError, theme])

  useEffect(() => {
    const SCRIPT_ID = 'cf-turnstile-script'

    if (window.turnstile) {
      renderWidget()
      return
    }

    window.onTurnstileLoad = renderWidget

    if (!document.getElementById(SCRIPT_ID)) {
      const s = document.createElement('script')
      s.id = SCRIPT_ID
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit'
      s.async = true
      s.defer = true
      document.head.appendChild(s)
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current) } catch { /* ignore */ }
        widgetIdRef.current = null
      }
    }
  }, [renderWidget])

  return (
    <div className="w-full">
      <div ref={containerRef} className="w-full" />
    </div>
  )
}

export function TurnstileShield() {
  return (
    <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-1">
      <ShieldCheck className="w-3 h-3 text-[#f6821f]" />
      <span>Protected by Cloudflare Turnstile</span>
    </div>
  )
}
