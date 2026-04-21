'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const ENJO_WEBCHAT_ID = '69e790a16ab43364c44c0543'
const ENJO_API_URL = 'https://api.app.enjo.ai'
const ENJO_SCRIPT_SRC = 'https://app.enjo.ai/webchat/js/webchat.js'
const ENJO_SCRIPT_ID = 'enjoWebchatCopilot'

type EnjoWindow = Window & {
  ENJO_WEBCHAT_ID?: string
  ENJO_API_URL?: string
  $enjo?: unknown[]
}

export function EnjoChat() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (document.getElementById(ENJO_SCRIPT_ID)) return

    const w = window as EnjoWindow
    w.ENJO_WEBCHAT_ID = ENJO_WEBCHAT_ID
    w.ENJO_API_URL = ENJO_API_URL
    w.$enjo = w.$enjo || []

    const s = document.createElement('script')
    s.id = ENJO_SCRIPT_ID
    s.src = ENJO_SCRIPT_SRC
    s.async = true
    s.defer = true
    document.head.appendChild(s)

    ;(async () => {
      try {
        const supabase = createClient()
        if (!supabase) return
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone')
          .eq('id', user.id)
          .single()

        const name = profile?.full_name || user.email?.split('@')[0] || 'User'

        const push = () => {
          const queue = (window as EnjoWindow).$enjo
          if (!Array.isArray(queue)) return
          queue.push(['identify', {
            id: user.id,
            email: user.email,
            name,
            phone: profile?.phone,
          }])
        }
        setTimeout(push, 1500)
      } catch {
        /* identification is best-effort — anonymous chat still works */
      }
    })()
  }, [])

  return null
}
