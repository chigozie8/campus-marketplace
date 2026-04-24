'use client'

import Script from 'next/script'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const LIVECHAT_AI_ID =
  process.env.NEXT_PUBLIC_LIVECHAT_AI_ID || 'cmocanyz400ggjl04oqfx0n20'

const MOBILE_BREAKPOINT = 768
const MOBILE_BOTTOM_OFFSET = 140
const DESKTOP_BOTTOM_OFFSET = 16

const TARGET_SELECTORS = [
  '.live-chat-ai-button',
  '.live-chat-ai-animation-canvas',
  '.live-chat-ai-wrapper',
  '.live-chat-ai-button-logo-wrapper',
]

function collectShadowRoots(root: Document | ShadowRoot, acc: ShadowRoot[]) {
  const all = root.querySelectorAll('*')
  for (let i = 0; i < all.length; i++) {
    const el = all[i] as HTMLElement
    const sr = el.shadowRoot
    if (sr) {
      acc.push(sr)
      collectShadowRoots(sr, acc)
    }
  }
}

function findTargets(): HTMLElement[] {
  const found: HTMLElement[] = []
  const roots: (Document | ShadowRoot)[] = [document]
  const shadows: ShadowRoot[] = []
  collectShadowRoots(document, shadows)
  roots.push(...shadows)

  for (const root of roots) {
    for (const sel of TARGET_SELECTORS) {
      root.querySelectorAll(sel).forEach((el) => found.push(el as HTMLElement))
    }
  }
  return found
}

function applyOffset() {
  const isMobile = window.innerWidth <= MOBILE_BREAKPOINT
  const offsetPx = isMobile ? MOBILE_BOTTOM_OFFSET : DESKTOP_BOTTOM_OFFSET
  const value = isMobile
    ? `calc(${offsetPx}px + env(safe-area-inset-bottom, 0px))`
    : `${offsetPx}px`

  const targets = findTargets()
  targets.forEach((el) => {
    el.style.setProperty('bottom', value, 'important')
  })
}

export function LiveChatAI() {
  const pathname = usePathname()
  const isHome = pathname === '/'

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!isHome) return

    let raf = 0
    const schedule = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(applyOffset)
    }

    schedule()

    const fastInterval = window.setInterval(schedule, 250)
    const slowDownTimer = window.setTimeout(() => {
      window.clearInterval(fastInterval)
      window.setInterval(schedule, 1500)
    }, 10000)

    const observer = new MutationObserver(schedule)
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    })

    window.addEventListener('resize', schedule)
    window.addEventListener('orientationchange', schedule)

    return () => {
      cancelAnimationFrame(raf)
      window.clearInterval(fastInterval)
      window.clearTimeout(slowDownTimer)
      observer.disconnect()
      window.removeEventListener('resize', schedule)
      window.removeEventListener('orientationchange', schedule)
    }
  }, [isHome])

  if (!LIVECHAT_AI_ID) return null
  if (!isHome) return null

  return (
    <Script
      id="livechat-ai-embed"
      src="https://app.livechatai.com/embed.js"
      data-id={LIVECHAT_AI_ID}
      strategy="afterInteractive"
      async
      defer
    />
  )
}
