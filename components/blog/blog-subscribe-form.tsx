'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function BlogSubscribeForm() {
  const [loading, setLoading] = useState(false)

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const email = formData.get('email') as string
      
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      
      if (!res.ok) {
        toast.error(data.error || 'Failed to subscribe. Please try again.')
      } else {
        toast.success(data.message || 'You&apos;re subscribed!')
        ;(e.target as HTMLFormElement).reset()
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-5 text-white">
      <h3 className="text-base font-black mb-1">Get updates first</h3>
      <p className="text-white/80 text-xs leading-relaxed mb-4">
        New posts, seller tips & exclusive deals — straight to your inbox. No spam.
      </p>
      <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
        <input
          type="email"
          name="email"
          placeholder="your@email.com"
          required
          className="w-full px-3.5 py-2.5 rounded-xl bg-white/20 border border-white/30 focus:border-white text-white placeholder:text-white/50 outline-none text-sm"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-white text-primary font-bold text-sm hover:bg-white/90 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Subscribing...
            </>
          ) : (
            'Subscribe'
          )}
        </button>
      </form>
    </div>
  )
}
