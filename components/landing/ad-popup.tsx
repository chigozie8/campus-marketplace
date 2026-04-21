'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X, ArrowRight } from 'lucide-react'

interface Props {
  enabled: boolean
  title: string
  body: string
  imageUrl?: string
  ctaLabel?: string
  ctaHref?: string
  delayMs: number
  autoCloseMs: number
  /** 'session' = once per browser session, 'once' = once forever, 'always' = every page load */
  frequency: 'session' | 'once' | 'always'
}

const STORAGE_KEY = 'vx_ad_popup_dismissed'

/** Tiny non-cryptographic hash so a fresh ad bypasses any prior dismissal. */
function contentHash(title: string, body: string, ctaHref?: string) {
  const s = `${title}|${body}|${ctaHref ?? ''}`
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0
  }
  return String(h)
}

/**
 * Site-wide promotional popup. Renders nothing unless `enabled` is true and
 * the visitor hasn't already dismissed it according to the configured
 * `frequency`. Closes via the X button, the Escape key, or the auto-close
 * timer (when set).
 */
export function AdPopup({
  enabled, title, body, imageUrl, ctaLabel, ctaHref,
  delayMs, autoCloseMs, frequency,
}: Props) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!enabled) return

    // Respect prior dismissal — but only for the SAME ad content.
    // When admin edits the popup, the hash changes and the dismissal is bypassed
    // so visitors see the new ad even if they dismissed the old one.
    if (frequency !== 'always') {
      try {
        const store = frequency === 'once' ? localStorage : sessionStorage
        const dismissedHash = store.getItem(STORAGE_KEY)
        const currentHash = contentHash(title, body, ctaHref)
        if (dismissedHash === currentHash) return
      } catch { /* storage blocked — show anyway */ }
    }

    const showTimer = window.setTimeout(() => setOpen(true), Math.max(0, delayMs))
    return () => window.clearTimeout(showTimer)
  }, [enabled, delayMs, frequency, title, body, ctaHref])

  // Auto-close
  useEffect(() => {
    if (!open || autoCloseMs <= 0) return
    const t = window.setTimeout(() => close(), autoCloseMs)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, autoCloseMs])

  // Escape to close
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function close() {
    setOpen(false)
    if (frequency !== 'always') {
      try {
        const store = frequency === 'once' ? localStorage : sessionStorage
        store.setItem(STORAGE_KEY, contentHash(title, body, ctaHref))
      } catch { /* ignore */ }
    }
  }

  if (!enabled || !open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ad-popup-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close advertisement"
        onClick={close}
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
      />

      {/* Card */}
      <div className="relative w-full max-w-md rounded-3xl bg-card border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Close X */}
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-background/90 hover:bg-background border border-border flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors shadow-sm"
        >
          <X className="w-4 h-4" />
        </button>

        {imageUrl ? (
          <div className="relative w-full aspect-[16/9] bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        ) : (
          <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent px-6 pt-10 pb-2">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-primary px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              ✨ Featured
            </div>
          </div>
        )}

        <div className="p-6 sm:p-7 flex flex-col gap-3">
          <h3 id="ad-popup-title" className="text-xl sm:text-2xl font-black text-foreground tracking-tight leading-snug">
            {title}
          </h3>
          {body && (
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {body}
            </p>
          )}

          {ctaHref && ctaLabel && (
            <a
              href={ctaHref}
              onClick={() => close()}
              className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-primary hover:bg-primary/90 active:scale-[0.98] text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25 transition-all"
            >
              {ctaLabel}
              <ArrowRight className="w-4 h-4" />
            </a>
          )}

          <button
            type="button"
            onClick={close}
            className="mt-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors self-center"
          >
            No thanks
          </button>
        </div>
      </div>
    </div>
  )
}

// keeps Image import warning-free if treeshaken
void Image
