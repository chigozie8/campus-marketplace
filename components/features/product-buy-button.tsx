'use client'

import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CheckoutModal } from './checkout-modal'
import type { CheckoutProduct } from './checkout-modal'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { hapticImpact } from '@/lib/capacitor'

interface ProductBuyButtonProps {
  product: CheckoutProduct
  className?: string
}

export function ProductBuyButton({ product, className }: ProductBuyButtonProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  async function handleClick() {
    hapticImpact('medium')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error('Sign in to purchase', { description: 'You need an account to place an order.' })
      router.push('/auth/login')
      return
    }

    setOpen(true)
  }

  return (
    <>
      <Button
        onClick={handleClick}
        className={className}
        size="lg"
      >
        <ShoppingCart className="w-4 h-4 mr-2" />
        Buy Now
      </Button>
      <CheckoutModal
        open={open}
        onClose={() => setOpen(false)}
        product={product}
      />
    </>
  )
}
