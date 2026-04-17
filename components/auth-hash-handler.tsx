'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function AuthHashHandler() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const hash = window.location.hash.substring(1)
    if (!hash) return

    const params = new URLSearchParams(hash)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const type = params.get('type')

    if (!accessToken || !refreshToken) return

    // Clear the hash from the URL immediately so it doesn't linger
    window.history.replaceState(null, '', window.location.pathname + window.location.search)

    const supabase = createClient()
    supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) {
          router.replace('/auth/sign-up?error=link-expired')
          return
        }
        if (type === 'signup' || type === 'email_change') {
          router.replace('/auth/verified')
        } else if (type === 'recovery') {
          router.replace('/auth/reset-password')
        } else {
          router.replace('/dashboard')
        }
      })
  }, [router])

  return null
}
