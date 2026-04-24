'use client'

import Script from 'next/script'

const LIVECHAT_AI_ID =
  process.env.NEXT_PUBLIC_LIVECHAT_AI_ID || 'cmocanyz400ggjl04oqfx0n20'

export function LiveChatAI() {
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
