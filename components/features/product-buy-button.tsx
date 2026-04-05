'use client'

import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CheckoutModal } from './checkout-modal'
import type { BackendProduct } from '@/lib/api'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface ProductBuyButtonProps {
  product: BackendProduct
  className?: string
}

export function ProductBuyButton({ product, className }: ProductBuyButtonProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  async function handleClick() {
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
