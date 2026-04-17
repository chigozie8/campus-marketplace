'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ConfirmPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Parse hash fragment from URL (e.g. #access_token=...&refresh_token=...&type=signup)
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)

    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const type = params.get('type')
    const errorDesc = params.get('error_description')

    if (errorDesc) {
      setError(decodeURIComponent(errorDesc.replace(/\+/g, ' ')))
      return
    }

    if (accessToken && refreshToken) {
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ error: sessionError }) => {
          if (sessionError) {
            setError('Your confirmation link has expired. Please request a new one.')
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
      return
    }

    // No tokens in hash — might be a code-based (PKCE) redirect, hand off to callback
    const code = new URLSearchParams(window.location.search).get('code')
    if (code) {
      router.replace(`/auth/callback?code=${code}`)
      return
    }

    setError('Invalid or expired confirmation link. Please sign up again.')
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex flex-col items-center justify-center px-4 py-12">
        <Link href="/" className="mb-10">
          <span className="text-2xl font-black tracking-tight text-gray-950 leading-none">
            Vendoor<span className="text-[#16a34a]">X</span>
          </span>
        </Link>
        <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-sm px-8 py-12 text-center">
          <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-xl font-black text-gray-950 mb-2">Link expired</h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">{error}</p>
          <Link
            href="/auth/sign-up"
            className="inline-block bg-[#16a34a] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#15803d] transition-colors"
          >
            Sign up again
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col items-center justify-center px-4">
      <Link href="/" className="mb-10">
        <span className="text-2xl font-black tracking-tight text-gray-950 leading-none">
          Vendoor<span className="text-[#16a34a]">X</span>
        </span>
      </Link>
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-sm px-8 py-12 text-center">
        <Loader2 className="w-8 h-8 text-[#16a34a] animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-semibold text-sm">Confirming your email…</p>
      </div>
    </div>
  )
}
