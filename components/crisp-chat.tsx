'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Drop-in Crisp Chat loader. Activates only when NEXT_PUBLIC_CRISP_WEBSITE_ID
 * is set in your environment — otherwise renders nothing, keeping the existing
 * in-house ChatWidget as the support surface.
 *
 * Setup:
 *   1. Create a free workspace at https://crisp.chat
 *   2. Settings → Website → copy the Website ID
 *   3. Add NEXT_PUBLIC_CRISP_WEBSITE_ID to Replit Secrets
 *   4. Refresh — that's it. The widget appears bottom-right with your branding.
 */
export function CrispChat() {
  const websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID

  useEffect(() => {
    if (!websiteId) return
    if (typeof window === 'undefined') return

    type CrispWindow = Window & {
      $crisp?: unknown[]
      CRISP_WEBSITE_ID?: string
    }
    const w = window as CrispWindow

    if (w.$crisp) return // already loaded

    w.$crisp = []
    w.CRISP_WEBSITE_ID = websiteId

    const script = document.createElement('script')
    script.src = 'https://client.crisp.chat/l.js'
    script.async = true
    document.head.appendChild(script)

    // Identify the logged-in user to Crisp so support sees who's chatting
    ;(async () => {
      try {
        const supabase = createClient()
        if (!supabase) return
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone, avatar_url')
          .eq('id', user.id)
          .single()

        const name = profile?.full_name || user.email?.split('@')[0] || 'User'

        // Wait briefly for Crisp to initialize before pushing user data
        const push = () => {
          const $crisp = (window as CrispWindow).$crisp
          if (!Array.isArray($crisp)) return
          if (user.email) $crisp.push(['set', 'user:email', [user.email]])
          if (name) $crisp.push(['set', 'user:nickname', [name]])
          if (profile?.phone) $crisp.push(['set', 'user:phone', [profile.phone]])
          if (profile?.avatar_url) $crisp.push(['set', 'user:avatar', [profile.avatar_url]])
          $crisp.push([
            'set',
            'session:data',
            [[['user_id', user.id], ['platform', 'web']]],
          ])
        }
        setTimeout(push, 1500)
      } catch {
        /* identification is best-effort — anonymous chat still works */
      }
    })()
  }, [websiteId])

  return null
}
