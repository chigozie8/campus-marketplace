'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ResendConfirmationPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not send email.')
      setSent(true)
      toast.success('Confirmation email sent!', {
        description: 'Check your inbox in the next minute or two.',
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-10">
        <span className="text-2xl font-black tracking-tight text-gray-950 leading-none">
          Vendoor<span className="text-[#16a34a]">X</span>
        </span>
      </Link>

      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-sm px-8 py-12">
        {sent ? (
          <div className="text-center">
            <div className="w-14 h-14 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-7 h-7 text-[#16a34a]" />
            </div>
            <h2 className="text-xl font-black text-gray-950 mb-2">Check your email</h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              We've sent a fresh confirmation link to <span className="font-semibold text-gray-900">{email}</span>. Click it within the next hour.
            </p>
            <Link
              href="/auth/login"
              className="inline-block text-[#16a34a] font-bold text-sm hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Mail className="w-7 h-7 text-[#16a34a]" />
            </div>
            <h2 className="text-xl font-black text-gray-950 mb-2 text-center">Resend confirmation link</h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed text-center">
              Enter the email you signed up with and we'll send a new confirmation link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-gray-700 mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#16a34a] focus:bg-white transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#16a34a] text-white font-bold text-sm py-3 rounded-xl hover:bg-[#15803d] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send new link'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-500 mt-6">
              Remembered your password?{' '}
              <Link href="/auth/login" className="text-[#16a34a] font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
