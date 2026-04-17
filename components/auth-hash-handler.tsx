'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export function AuthHashHandler() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Handle ?welcome=1 from PKCE callback redirect
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.get('welcome') === '1') {
      toast.success('Welcome to VendoorX! 🎉', {
        description: "You're all verified — let's get you started.",
        duration: 5000,
      })
      searchParams.delete('welcome')
      const newSearch = searchParams.toString()
      window.history.replaceState(
        null, '',
        window.location.pathname + (newSearch ? `?${newSearch}` : '')
      )
    }

    const hash = window.location.hash.substring(1)
    if (!hash) return

    const params = new URLSearchParams(hash)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const type = params.get('type')
    const errorCode = params.get('error_code')
    const errorDesc = params.get('error_description')

    // Handle Supabase auth errors (expired link, etc) that get redirected to Site URL
    if (errorCode || errorDesc) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
      const isExpired = errorCode === 'otp_expired' || (errorDesc || '').toLowerCase().includes('expired')
      toast.error(
        isExpired ? 'Your confirmation link has expired' : 'Confirmation failed',
        {
          description: isExpired
            ? 'Links are valid for a limited time. Please request a new one below.'
            : decodeURIComponent((errorDesc || 'Please try again.').replace(/\+/g, ' ')),
          duration: 8000,
        }
      )
      router.replace('/auth/resend-confirmation')
      return
    }

    if (!accessToken || !refreshToken) return

    // Clear the hash from the URL immediately so it doesn't linger
    window.history.replaceState(null, '', window.location.pathname + window.location.search)

    const supabase = createClient()
    supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) {
          toast.error('Your link has expired. Please sign up again.')
          router.replace('/auth/sign-up')
          return
        }
        if (type === 'signup' || type === 'email_change') {
          toast.success('Welcome to VendoorX! 🎉', {
            description: "You're all verified — let's get you started.",
            duration: 5000,
          })
          router.replace('/dashboard')
        } else if (type === 'recovery') {
          router.replace('/auth/reset-password')
        } else {
          router.replace('/dashboard')
        }
      })
  }, [router])

  return null
}
