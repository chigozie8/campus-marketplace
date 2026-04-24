'use client'

import { useState, useEffect } from 'react'
import { Loader2, MapPin, ShoppingCart, Shield, Lock, Phone, Tag, CheckCircle2, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateOrder, useInitializePayment } from '@/hooks/use-orders'
import { toast } from 'sonner'
import { hapticImpact, hapticNotification } from '@/lib/capacitor'
import { SavedAddressesPicker } from '@/components/orders/saved-addresses-picker'

export interface CheckoutProduct {
  id: string
  title: string
  price: number
  images?: string[] | null
  stock_quantity?: number
  delivery_fee?: number | null
}

interface CheckoutModalProps {
  open: boolean
  onClose: () => void
  product: CheckoutProduct
  onPaystackRedirect?: () => void
}

interface AppliedCoupon {
  id: string
  code: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  description?: string
  discount: number
}

type Step = 'address' | 'confirm' | 'paying'

export function CheckoutModal({ open, onClose, product, onPaystackRedirect }: CheckoutModalProps) {
  const [step, setStep] = useState<Step>('address')
  const [address, setAddress] = useState('')
  const [saveAddress, setSaveAddress] = useState(false)
  const [addressLabel, setAddressLabel] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [orderId, setOrderId] = useState<string | null>(null)
  // Platform fee removed from buyer breakdown — kept as 0 so the math stays
  // intact and the line is hidden by the `platformFee > 0` guard below.
  const [platformFee] = useState(0)
  const [platformFeeLabel] = useState('')

  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)
  const [showCouponInput, setShowCouponInput] = useState(false)

  const createOrder = useCreateOrder()
  const initPayment = useInitializePayment()

  // Platform fee fetch removed — fee no longer charged to buyers.

  const subtotal = product.price * quantity
  const deliveryFee = product.delivery_fee ?? 0
  const couponDiscount = appliedCoupon?.discount ?? 0
  const total = Math.max(0, subtotal + deliveryFee + platformFee - couponDiscount)

  async function handleApplyCoupon() {
    const code = couponCode.trim().toUpperCase()
    if (!code) return
    setCouponLoading(true)
    try {
      const res = await fetch('/api/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, order_total: subtotal }),
      })
      const data = await res.json()
      if (!res.ok || !data.valid) {
        toast.error(data.error || 'Invalid or expired coupon')
        return
      }
      setAppliedCoupon({ ...data.coupon, discount: data.discount })
      toast.success(`Coupon applied! You save ₦${data.discount.toLocaleString()}`)
    } catch {
      toast.error('Failed to validate coupon')
    } finally {
      setCouponLoading(false)
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null)
    setCouponCode('')
    setShowCouponInput(false)
  }

  async function handleCreateOrder() {
    if (address.trim().length < 5) {
      toast.error('Please enter your full delivery address.')
      return
    }

    hapticImpact('medium')
    try {
      const result = await createOrder.mutateAsync({
        product_id: product.id,
        quantity,
        delivery_address: address.trim(),
        coupon_id: appliedCoupon?.id,
        coupon_discount: couponDiscount > 0 ? couponDiscount : undefined,
      })
      setOrderId(result.data.id)

      // Fire-and-forget save of the address to the buyer's address book.
      if (saveAddress && addressLabel.trim().length > 0) {
        fetch('/api/saved-addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ label: addressLabel.trim(), address: address.trim() }),
        }).catch(() => {})
      }

      setStep('confirm')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create order'
      toast.error(msg)
    }
  }

  async function handlePay() {
    if (!orderId) return
    hapticNotification('success')
    setStep('paying')
    try {
      const result = await initPayment.mutateAsync(orderId)
      onPaystackRedirect?.()
      // Close the modal BEFORE navigating so it is never frozen open in the
      // browser's back-forward cache. If the user returns via back button or
      // Paystack cancels back to this page, the modal is already shut.
      handleClose()
      window.location.href = result.data.authorization_url
    } catch {
      setStep('confirm')
    }
  }

  function handleClose() {
    setStep('address')
    setAddress('')
    setSaveAddress(false)
    setAddressLabel('')
    setQuantity(1)
    setOrderId(null)
    setCouponCode('')
    setAppliedCoupon(null)
    setShowCouponInput(false)
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
              <SavedAddressesPicker onPick={setAddress} currentValue={address} />
              <Textarea
                placeholder="Enter your full delivery address (street, area, city)…"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="rounded-xl resize-none text-sm"
                rows={3}
              />
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={saveAddress}
                  onChange={e => setSaveAddress(e.target.checked)}
                  className="h-3.5 w-3.5 rounded accent-emerald-600"
                />
                Save this address for next time
              </label>
              {saveAddress && (
                <Input
                  placeholder="Label (e.g. Hostel A — Room 12)"
                  value={addressLabel}
                  onChange={e => setAddressLabel(e.target.value)}
                  maxLength={60}
                  className="rounded-xl text-sm"
                />
              )}
            </div>

            {/* Coupon Code */}
            {appliedCoupon ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    {appliedCoupon.code} applied!
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                    You save ₦{appliedCoupon.discount.toLocaleString()}
                  </p>
                </div>
                <button onClick={removeCoupon} className="text-emerald-600 hover:text-emerald-800 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : showCouponInput ? (
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  Coupon Code
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                    className="rounded-xl text-sm font-mono tracking-widest"
                    autoCapitalize="characters"
                  />
                  <Button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    variant="outline"
                    className="rounded-xl shrink-0 font-bold"
                  >
                    {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                  </Button>
                </div>
                <button
                  onClick={() => setShowCouponInput(false)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCouponInput(true)}
                className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline transition-colors"
              >
                <Tag className="w-3.5 h-3.5" />
                Have a coupon code?
              </button>
            )}

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
                <span className="text-muted-foreground">Subtotal ({quantity}x)</span>
                <span className="font-semibold">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Delivery fee</span>
                {deliveryFee > 0
                  ? <span className="font-semibold">₦{deliveryFee.toLocaleString()}</span>
                  : <span className="font-semibold text-emerald-600">Free</span>
                }
              </div>
              {platformFee > 0 && (
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">{platformFeeLabel}</span>
                  <span className="font-semibold">₦{platformFee.toLocaleString()}</span>
                </div>
              )}
              {appliedCoupon && couponDiscount > 0 && (
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Coupon ({appliedCoupon.code})
                  </span>
                  <span className="font-bold text-emerald-600">-₦{couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between py-2">
                <span className="font-black">Total</span>
                <span className="font-black text-primary text-base">₦{total.toLocaleString()}</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-muted/50 flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{address}</span>
            </div>
            {/* Escrow protection badge */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Escrow Protected — Your Money Is Safe</p>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5 leading-relaxed">
                  Payment goes to VendoorX escrow — not the seller. Released only after you confirm delivery.
                  Full refund if anything goes wrong.
                </p>
              </div>
            </div>

            <Button
              onClick={handlePay}
              disabled={initPayment.isPending}
              className="w-full h-11 rounded-xl font-bold text-sm gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/25"
            >
              <Lock className="w-4 h-4" />
              Pay Securely ₦{total.toLocaleString()} via Paystack
            </Button>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep('address')}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Edit address
              </button>
              <a
                href="tel:07082039150"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="w-3 h-3" />
                07082039150
              </a>
            </div>
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
