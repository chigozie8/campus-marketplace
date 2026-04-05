'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'
import { toast } from 'sonner'

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, text: `Check this out on VendoorX: ${title}`, url })
        return
      } catch {
        // cancelled or unsupported — fall through
      }
    }
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    setCopied(true)
    toast.success('Link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleShare}
      className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-muted transition-colors text-gray-500 hover:text-primary"
      aria-label="Share"
    >
      {copied
        ? <Check className="w-4 h-4 text-green-500" />
        : <Share2 className="w-4 h-4" />
      }
    </button>
  )
}
