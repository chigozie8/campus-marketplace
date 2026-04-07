'use client'

import { useState } from 'react'
import { Send, CheckCircle2, Loader2 } from 'lucide-react'

interface NewsletterFormProps {
  className?: string
  variant?: 'inline' | 'card'
}

export function NewsletterForm({ className = '', variant = 'inline' }: NewsletterFormProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setMessage(data.message || 'Subscribed! Check your email.')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong.')
      }
    } catch {
      setStatus('error')
      setMessage('Connection error. Try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className={`flex items-center gap-2 text-green-600 font-semibold ${className}`}>
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
        <span>{message}</span>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className={`rounded-2xl bg-[#0a0a0a] p-6 text-white ${className}`}>
        <h3 className="text-lg font-black mb-1">Stay in the loop</h3>
        <p className="text-sm text-white/60 mb-4">
          Campus deals, new features & seller tips — straight to your inbox.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#16a34a] transition-colors"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="flex items-center gap-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60 flex-shrink-0"
          >
            {status === 'loading' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Subscribe
          </button>
        </form>
        {status === 'error' && (
          <p className="mt-2 text-xs text-red-400">{message}</p>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#16a34a] transition-colors min-w-0"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="flex items-center gap-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-60 flex-shrink-0"
      >
        {status === 'loading' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">Subscribe</span>
      </button>
    </form>
  )
}
