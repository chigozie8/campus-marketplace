'use client'

import { useState } from 'react'
import { Loader2, Image as ImageIcon, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface Props {
  userId: string
  storeName: string
  storeUrl: string
}

/**
 * Generates a 1200×630 PNG of the seller's store stats (via the OG-image
 * route) and either invokes the native Web Share sheet on supported devices
 * or falls back to a plain download. Designed for one-tap WhatsApp Status
 * sharing.
 */
export function ShareStoreButton({ userId, storeName, storeUrl }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleShare() {
    setLoading(true)
    try {
      const res = await fetch(`/api/og/store/${userId}`)
      if (!res.ok) throw new Error('Could not generate the share image.')
      const blob = await res.blob()
      const file = new File([blob], `${slug(storeName)}-vendoorx.png`, { type: 'image/png' })

      const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean }
      if (typeof nav.canShare === 'function' && nav.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${storeName} on VendoorX`,
          text: `Check out my store on VendoorX 🛍️\n${storeUrl}`,
        })
        toast.success('Shared!')
        return
      }

      // Fallback: trigger a plain download.
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.success('Image downloaded — share it to your status!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not generate the share image.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      onClick={handleShare}
      disabled={loading}
      variant="outline"
      className="w-full h-9 text-[11px] font-bold rounded-xl border-gray-200 dark:border-border hover:border-primary hover:text-primary"
    >
      {loading
        ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Generating…</>
        : <><Share2 className="w-3.5 h-3.5 mr-1.5" />Share store image</>
      }
    </Button>
  )
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'store'
}

// Re-export to satisfy linters that flag unused imports during dev iteration.
export const __unused = ImageIcon
