'use client'

import { useState, useEffect, useRef } from 'react'
import { ShoppingCart, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CheckoutModal } from './checkout-modal'
import type { CheckoutProduct } from './checkout-modal'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { hapticImpact } from '@/lib/capacitor'

interface ProductBuyButtonProps {
  product: CheckoutProduct
  sellerId?: string
  className?: string
}

export function ProductBuyButton({ product, sellerId, className }: ProductBuyButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  // Track whether we navigated away to Paystack so we know when to close the modal on return
  const wentToPaystack = useRef(false)

  useEffect(() => {
    // pageshow fires when the page is shown — e.persisted=true means it came
    // from bfcache (browser back button after Paystack redirect). The modal
    // invisible backdrop would block all clicks in that case, so force-close it.
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        setOpen(false)
        wentToPaystack.current = false
      }
    }

    // visibilitychange catches the user returning from the Paystack tab on
    // mobile (the browser doesn't always do a bfcache restore in that flow).
    // Only close if we actually navigated away to Paystack.
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && wentToPaystack.current) {
        setOpen(false)
        wentToPaystack.current = false
      }
    }

    window.addEventListener('pageshow', handlePageShow)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.removeEventListener('pageshow', handlePageShow)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  async function handleClick() {
    if (loading) return
    hapticImpact('medium')
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Sign in to purchase', { description: 'You need an account to place an order.' })
        router.push('/auth/login')
        return
      }

      if (sellerId && user.id === sellerId) {
        toast.error('This is your own listing', { description: 'You cannot buy a product you listed.' })
        return
      }

      setOpen(true)
    } finally {
      setLoading(false)
    }
  }

  // Called by CheckoutModal when it redirects to Paystack
  function handlePaystackRedirect() {
    wentToPaystack.current = true
  }

  return (
    <>
      <Button
        onClick={handleClick}
        className={className}
        size="lg"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Loading…
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Buy Now
          </>
        )}
      </Button>
      <CheckoutModal
        open={open}
        onClose={() => setOpen(false)}
        product={product}
        onPaystackRedirect={handlePaystackRedirect}
      />
    </>
  )
}
