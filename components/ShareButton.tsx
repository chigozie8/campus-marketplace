'use client'

import { useState } from 'react'
import { Share2, Link2, Check, MessageCircle } from 'lucide-react'

type Props = {
  title: string
  url?: string
  variant?: 'icon' | 'full'
}

export function ShareButton({ title, url, variant = 'icon' }: Props) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const shareUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '')
  const encoded = encodeURIComponent(`${title} — ${shareUrl}`)
  const whatsappUrl = `https://wa.me/?text=${encoded}`

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => { setCopied(false); setOpen(false) }, 2000)
  }

  if (variant === 'full') {
    return (
      <div className="flex gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] text-white text-sm font-bold hover:opacity-90 transition-opacity"
        >
          <MessageCircle className="w-4 h-4" />
          Share on WhatsApp
        </a>
        <button
          onClick={copyLink}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-sm font-bold hover:bg-muted transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Link2 className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="p-2 rounded-xl border border-border bg-card hover:bg-muted transition-colors"
        title="Share"
      >
        <Share2 className="w-4 h-4 text-muted-foreground" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-40 bg-card border border-border rounded-2xl shadow-xl p-2 min-w-[180px] space-y-1">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold hover:bg-muted transition-colors text-foreground"
              onClick={() => setOpen(false)}
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              Share on WhatsApp
            </a>
            <button
              onClick={copyLink}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold hover:bg-muted transition-colors text-foreground"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Link2 className="w-4 h-4 text-muted-foreground" />}
              {copied ? 'Link Copied!' : 'Copy Link'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
