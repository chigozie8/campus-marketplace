'use client'

import { useState } from 'react'
import { Zap, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface Props {
  storeBoostExpiresAt?: string | null
}

export function BoostStoreButton({ storeBoostExpiresAt }: Props) {
  const [loading, setLoading] = useState(false)

  const isActive = storeBoostExpiresAt && new Date(storeBoostExpiresAt) > new Date()
  const expiresIn = isActive
    ? Math.ceil((new Date(storeBoostExpiresAt!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0

  async function handleBoost() {
    setLoading(true)
    try {
      const res = await fetch('/api/boost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boostType: 'store', action: 'initiate' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to initiate store boost')
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (isActive) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-primary font-semibold bg-primary/5 border border-primary/20 rounded-lg px-3 py-1.5">
        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
        <span>Store featured · {expiresIn}d left</span>
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleBoost}
      disabled={loading}
      className="gap-1.5 text-xs h-8 rounded-lg border-primary/30 text-primary hover:bg-primary/5 hover:border-primary w-full"
      title="Feature your entire store for 7 days — ₦2,500"
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Zap className="w-3 h-3" />
      )}
      Boost Store — ₦2,500 / 7 days
    </Button>
  )
}
