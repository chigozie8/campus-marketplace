'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

function toStoreSlug(fullName: string): string {
  return fullName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

interface CopyStoreLinkProps {
  userId: string
  fullName?: string | null
}

export function CopyStoreLink({ userId, fullName }: CopyStoreLinkProps) {
  const [copied, setCopied] = useState(false)

  const slug = fullName ? `${toStoreSlug(fullName)}-${userId.slice(0, 6)}` : userId

  async function copy() {
    const url = `${window.location.origin}/store/${slug}`
    await navigator.clipboard.writeText(url).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-1.5">
      <button
        onClick={copy}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30 hover:bg-sky-100 dark:hover:bg-sky-950/50 transition-all border border-sky-100 dark:border-sky-900/40 w-full justify-center"
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
        {copied ? 'Link copied!' : 'Copy store link'}
      </button>
      <p className="text-[10px] text-center text-muted-foreground truncate">/store/{slug}</p>
    </div>
  )
}
