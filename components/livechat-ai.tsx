'use client'

import Script from 'next/script'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const LIVECHAT_AI_ID =
  process.env.NEXT_PUBLIC_LIVECHAT_AI_ID || 'cmocanyz400ggjl04oqfx0n20'

const STYLE_ID = 'vendoorx-lcai-position-fix'

const POSITION_CSS = `
  @media (max-width: 768px) {
    .live-chat-ai-button,
    .live-chat-ai-animation-canvas,
    .live-chat-ai-button-logo-wrapper {
      bottom: calc(110px + env(safe-area-inset-bottom, 0px)) !important;
    }
  }
`

function getHost(): HTMLElement | null {
  return document.querySelector('live-chat-ai-host') as HTMLElement | null
}

function injectShadowStyle(): boolean {
  const host = getHost()
  const shadow = host?.shadowRoot
  if (!host || !shadow) return false

  host.style.display = ''

  if (shadow.getElementById(STYLE_ID)) return true
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = POSITION_CSS
  shadow.appendChild(style)
  return true
}

function hideHost() {
  const host = getHost()
  if (host) host.style.display = 'none'
}

export function LiveChatAI() {
  const pathname = usePathname()
  const isHome = pathname === '/'

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!isHome) {
      hideHost()
      return
    }

    if (injectShadowStyle()) return

    let attempts = 0
    const interval = window.setInterval(() => {
      attempts += 1
      if (injectShadowStyle() || attempts > 60) {
        window.clearInterval(interval)
      }
    }, 500)

    return () => {
      window.clearInterval(interval)
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
