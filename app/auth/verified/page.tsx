'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export default function VerifiedPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    if (countdown <= 0) {
      router.replace('/dashboard')
      return
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown, router])

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col items-center justify-center px-4 py-12">

      {/* Logo */}
      <Link href="/" className="mb-10">
        <span className="text-2xl font-black tracking-tight text-gray-950 leading-none">
          Vendoor<span className="text-[#16a34a]">X</span>
        </span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-sm px-8 py-12 text-center">

        {/* Animated icon */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 bg-[#16a34a]/20 rounded-full animate-ping" />
          <div className="relative w-20 h-20 bg-[#16a34a] rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
        </div>

        <h1 className="text-2xl font-black text-gray-950 tracking-tight mb-2">
          You&apos;re verified! 🎉
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Your email has been confirmed. Welcome to VendoorX — Nigeria&apos;s campus marketplace.
        </p>

        {/* Auto-redirect indicator */}
        <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl px-5 py-4 mb-6">
          <p className="text-[#15803d] text-sm font-semibold">
            Taking you to your dashboard in{' '}
            <span className="text-lg font-black tabular-nums">{countdown}</span>s…
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-block bg-[#0a0a0a] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#1a1a1a] transition-colors"
        >
          Go to dashboard now →
        </Link>
      </div>

    </div>
  )
}
