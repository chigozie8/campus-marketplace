'use client'

import { useState } from 'react'

export default function ComingSoonPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Something went wrong. Try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100001] overflow-y-auto bg-white flex flex-col">

      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 flex-shrink-0" />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12">
        <div className="w-full max-w-lg">

          {/* Badge */}
          <div className="flex justify-center mb-8">
            <span className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Coming Soon
            </span>
          </div>

          {/* Logo */}
          <div className="text-center mb-6">
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-gray-950 leading-none">
              Vendoor<span className="text-green-500">X</span>
            </h1>
            <div className="mt-3 mx-auto w-20 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent rounded-full" />
          </div>

          {/* Headline */}
          <h2 className="text-center text-xl sm:text-2xl font-bold text-gray-800 mb-3 leading-snug px-2">
            Nigeria&apos;s #1 WhatsApp Vendor Marketplace
          </h2>

          {/* Description */}
          <p className="text-center text-gray-500 text-sm sm:text-base leading-relaxed mb-8 px-2">
            We&apos;re putting the finishing touches on something amazing.
            Buy from verified vendors, pay securely, and connect over WhatsApp — all in one place.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {['Verified Vendors', 'WhatsApp Checkout', 'Secure Escrow', 'Campus Delivery'].map(f => (
              <span key={f} className="text-xs font-medium text-green-700 bg-green-50 border border-green-100 px-3 py-1.5 rounded-full">
                {f}
              </span>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 mb-8" />

          {/* Email signup */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 sm:p-6 mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-1">Get notified when we launch</p>
            <p className="text-xs text-gray-400 mb-4">Be the first to know. No spam, ever.</p>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={loading}
                  className="flex-1 min-w-0 bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all disabled:opacity-60"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600 active:scale-95 disabled:opacity-60 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all whitespace-nowrap shadow-sm shadow-green-200"
                >
                  {loading ? 'Saving…' : 'Notify Me'}
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                You&apos;re on the list! We&apos;ll reach out soon.
              </div>
            )}

            {error && (
              <p className="mt-2 text-xs text-red-500">{error}</p>
            )}
          </div>

          {/* WhatsApp CTA */}
          <div className="text-center">
            <a
              href="https://wa.me/2348000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-green-600 text-sm transition-colors"
            >
              <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat with us on WhatsApp
            </a>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-gray-100 py-4 px-5 text-center">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} VendoorX · Nigeria&apos;s Vendor Marketplace · www.vendoorx.ng
        </p>
      </div>
    </div>
  )
}
