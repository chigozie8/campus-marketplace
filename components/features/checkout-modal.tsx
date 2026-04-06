'use client'

import { useState } from 'react'
import { Loader2, MapPin, ShoppingCart, CreditCard, CheckCircle2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useCreateOrder, useInitializePayment } from '@/hooks/use-orders'
import { toast } from 'sonner'

export interface CheckoutProduct {
  id: string
  title: string
  price: number
  images?: string[] | null
  stock_quantity?: number
}

interface CheckoutModalProps {
  open: boolean
  onClose: () => void
  product: CheckoutProduct
}

type Step = 'address' | 'confirm' | 'paying'

export function CheckoutModal({ open, onClose, product }: CheckoutModalProps) {
  const [step, setStep] = useState<Step>('address')
  const [address, setAddress] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [orderId, setOrderId] = useState<string | null>(null)

  const createOrder = useCreateOrder()
  const initPayment = useInitializePayment()

  const total = product.price * quantity

  async function handleCreateOrder() {
    if (address.trim().length < 5) {
      toast.error('Please enter your full delivery address.')
      return
    }

    const result = await createOrder.mutateAsync({
      product_id: product.id,
      quantity,
      delivery_address: address.trim(),
    })

    setOrderId(result.data.id)
    setStep('confirm')
  }

  async function handlePay() {
    if (!orderId) return
    setStep('paying')

    try {
      const result = await initPayment.mutateAsync(orderId)
      window.location.href = result.data.authorization_url
    } catch {
      setStep('confirm')
    }
  }

  function handleClose() {
    setStep('address')
    setAddress('')
    setQuantity(1)
    setOrderId(null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-black">
            {step === 'address' && 'Complete Your Order'}
            {step === 'confirm' && 'Confirm & Pay'}
            {step === 'paying' && 'Redirecting to Payment…'}
          </DialogTitle>
        </DialogHeader>

        {/* Product summary */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm line-clamp-1">{product.title}</p>
            <p className="text-primary font-black text-base mt-0.5">
              ₦{(product.price * quantity).toLocaleString()}
            </p>
          </div>
        </div>

        {step === 'address' && (
          <div className="space-y-4">
            {/* Quantity */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Quantity</Label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-xl border border-border flex items-center justify-center font-bold hover:bg-muted transition-colors"
                >−</button>
                <span className="w-8 text-center font-black text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock_quantity ?? 99, q + 1))}
                  className="w-9 h-9 rounded-xl border border-border flex items-center justify-center font-bold hover:bg-muted transition-colors"
                >+</button>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Delivery Address
              </Label>
              <Textarea
                placeholder="Enter your full delivery address (street, area, city)…"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="rounded-xl resize-none text-sm"
                rows={3}
              />
            </div>

            <Button
              onClick={handleCreateOrder}
              disabled={createOrder.isPending || address.trim().length < 5}
              className="w-full h-11 rounded-xl font-bold text-sm"
            >
              {createOrder.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Placing Order…</>
              ) : (
                <>Continue to Payment →</>
              )}
            </Button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">₦{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-semibold text-emerald-600">Free</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-black">Total</span>
                <span className="font-black text-primary text-base">₦{total.toLocaleString()}</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-muted/50 flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{address}</span>
            </div>
            <Button
              onClick={handlePay}
              disabled={initPayment.isPending}
              className="w-full h-11 rounded-xl font-bold text-sm gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Pay ₦{total.toLocaleString()} with Paystack
            </Button>
            <button
              onClick={() => setStep('address')}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Edit address
            </button>
          </div>
        )}

        {step === 'paying' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground text-center">
              Opening Paystack secure payment…
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
