'use client'

import Script from 'next/script'
import { useEffect } from 'react'

const LIVECHAT_AI_ID =
  process.env.NEXT_PUBLIC_LIVECHAT_AI_ID || 'cmocanyz400ggjl04oqfx0n20'

const MOBILE_BREAKPOINT = 768
const MOBILE_BOTTOM_OFFSET = '120px'
const DESKTOP_BOTTOM_OFFSET = '1rem'

const TARGET_SELECTORS = [
  '.live-chat-ai-button',
  '.live-chat-ai-animation-canvas',
  '.live-chat-ai-wrapper',
]

function findTargets(root: ParentNode): Element[] {
  const found: Element[] = []
  for (const sel of TARGET_SELECTORS) {
    root.querySelectorAll(sel).forEach((el) => found.push(el))
  }
  document.querySelectorAll('*').forEach((el) => {
    const sr = (el as HTMLElement).shadowRoot
    if (sr) {
      for (const sel of TARGET_SELECTORS) {
        sr.querySelectorAll(sel).forEach((node) => found.push(node))
      }
    }
  })
  return found
}

function applyOffset() {
  const isMobile = window.innerWidth <= MOBILE_BREAKPOINT
  const offset = isMobile
    ? `calc(${MOBILE_BOTTOM_OFFSET} + env(safe-area-inset-bottom, 0px))`
    : DESKTOP_BOTTOM_OFFSET

  findTargets(document).forEach((el) => {
    ;(el as HTMLElement).style.setProperty('bottom', offset, 'important')
  })
}

export function LiveChatAI() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    let raf = 0
    const schedule = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(applyOffset)
    }

    schedule()
    const interval = window.setInterval(schedule, 1000)

    const observer = new MutationObserver(schedule)
    observer.observe(document.body, { childList: true, subtree: true })

    window.addEventListener('resize', schedule)
    window.addEventListener('orientationchange', schedule)

    return () => {
      cancelAnimationFrame(raf)
      window.clearInterval(interval)
      observer.disconnect()
      window.removeEventListener('resize', schedule)
      window.removeEventListener('orientationchange', schedule)
    }
  }, [])

  if (!LIVECHAT_AI_ID) return null

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
