'use client'

import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export default function ConfirmPage() {
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
