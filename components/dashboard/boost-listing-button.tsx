'use client'

import { useState, useEffect } from 'react'
import { Zap, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface Props {
  productId: string
  productTitle: string
  isBoosted?: boolean
  boostExpiresAt?: string | null
}

export function BoostListingButton({ productId, productTitle, isBoosted, boostExpiresAt }: Props) {
  const [loading, setLoading]       = useState(false)
  const [priceKobo, setPriceKobo]   = useState<number | null>(null)
  const [durationDays, setDuration] = useState(7)

  useEffect(() => {
    fetch('/api/boost/prices')
      .then(r => r.json())
      .then(d => {
        if (d.listingPriceKobo) setPriceKobo(d.listingPriceKobo)
        if (d.durationDays)     setDuration(d.durationDays)
      })
      .catch(() => setPriceKobo(150000))
  }, [])

  const isActive = isBoosted && boostExpiresAt && new Date(boostExpiresAt) > new Date()
  const expiresIn = isActive
    ? Math.ceil((new Date(boostExpiresAt!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0

  const priceNaira = priceKobo != null ? (priceKobo / 100).toLocaleString('en-NG') : '…'

  async function handleBoost() {
    setLoading(true)
    try {
      const res = await fetch('/api/boost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, action: 'initiate' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to initiate boost')
      if (data.authorizationUrl) window.location.href = data.authorizationUrl
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (isActive) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Boosted · {expiresIn}d left
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleBoost}
      disabled={loading || priceKobo === null}
      className="gap-1.5 text-xs h-7 rounded-lg border-primary/30 text-primary hover:bg-primary/5 hover:border-primary"
      title={`Boost "${productTitle}" for ${durationDays} days`}
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
      Boost — ₦{priceNaira}
    </Button>
  )
}
