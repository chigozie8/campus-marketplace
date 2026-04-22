'use client'

import { useEffect } from 'react'
import { Crisp } from 'crisp-sdk-web'
import { createClient } from '@/lib/supabase/client'

const CRISP_WEBSITE_ID =
  process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID ||
  'bb298b2b-c7cf-4245-89bf-951f5a8047dc'

export function CrispChat() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!CRISP_WEBSITE_ID) return

    Crisp.configure(CRISP_WEBSITE_ID)
    Crisp.setColorTheme('green')

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

        if (user.email) Crisp.user.setEmail(user.email)
        if (name) Crisp.user.setNickname(name)
        if (profile?.phone) Crisp.user.setPhone(profile.phone)
        if (profile?.avatar_url) Crisp.user.setAvatar(profile.avatar_url)

        Crisp.session.setData({
          user_id: user.id,
          platform: 'web',
        })
      } catch {
        /* identification is best-effort — anonymous chat still works */
      }
    })()
  }, [])

  return null
}
