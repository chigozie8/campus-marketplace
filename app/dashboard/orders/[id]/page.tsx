'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Package, Loader2, CheckCircle2, AlertOctagon,
  Wallet, Truck, Clock, ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import { ordersApi, type BackendOrder } from '@/lib/api'
import { OrderStatusTracker, OrderStatusBadge } from '@/components/features/order-status-tracker'
import { OrderChat } from '@/components/features/order-chat'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [order, setOrder] = useState<BackendOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [me, setMe] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)

  async function load() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(`/auth/login?redirect=/dashboard/orders/${id}`)
        return
      }
      setMe(user.id)
      const result = await ordersApi.getById(id)
      setOrder(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handlePay() {
    if (!order || paying) return
    setPaying(true)
    try {
      const result = await ordersApi.initializePayment(order.id)
      window.location.href = result.data.authorization_url
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not start payment')
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
          <AlertOctagon className="w-7 h-7 text-red-500" />
        </div>
        <div>
          <p className="text-base font-bold text-foreground">{error || 'Order not found'}</p>
          <p className="text-sm text-muted-foreground mt-1">It may have been removed or you don't have access.</p>
        </div>
        <Link href="/dashboard/orders" className="text-sm text-primary hover:underline">Back to orders</Link>
      </div>
    )
  }

  const product = order.products
  const productTitle = product?.title ?? product?.name ?? 'Product'
  const image = product?.images?.[0] ?? product?.image_url ?? null
  const shortId = order.id.split('-')[0].toUpperCase()
  const isBuyer = me === order.buyer_id
  const showPay = isBuyer && order.status === 'pending'

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-background">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6 pb-20">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Link
            href="/dashboard/orders"
            className="w-9 h-9 rounded-xl border border-border/60 flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-black text-foreground truncate">Order #{shortId}</h1>
            <p className="text-xs text-muted-foreground">
              {new Date(order.created_at).toLocaleDateString('en-NG', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Product card */}
        <div className="rounded-2xl border border-border bg-card p-4 mb-4 flex items-start gap-3 sm:gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-muted relative flex-shrink-0">
            {image ? (
              <Image src={image} alt={productTitle} fill sizes="80px" className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-7 h-7 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Link
              href={product?.id ? `/marketplace/${product.id}` : '/marketplace'}
              className="font-bold text-sm sm:text-base text-foreground line-clamp-2 hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              {productTitle}
              <ExternalLink className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
            </Link>
            <p className="text-xs text-muted-foreground mt-1">Qty: {order.quantity}</p>
            <p className="font-black text-base text-primary mt-2">
              ₦{Number(order.total_amount).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Status tracker */}
        <div className="rounded-2xl border border-border bg-card p-4 mb-4">
          <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">Order Progress</p>
          <OrderStatusTracker status={order.status} />
        </div>

        {/* Pay action for pending orders */}
        {showPay && (
          <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-4 mb-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-foreground">Complete your payment</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your order is held safely in escrow until you confirm delivery.
                </p>
              </div>
            </div>
            <Button onClick={handlePay} disabled={paying} className="w-full h-11 rounded-xl gap-2">
              {paying
                ? <><Loader2 className="w-4 h-4 animate-spin" />Opening Paystack…</>
                : <><Wallet className="w-4 h-4" />Pay ₦{Number(order.total_amount).toLocaleString()}</>
              }
            </Button>
          </div>
        )}

        {/* Status hints */}
        {order.status === 'paid' && (
          <div className="rounded-2xl border border-border bg-card p-4 mb-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-foreground">Waiting for the seller to ship</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                You'll be notified the moment your order is on its way.
              </p>
            </div>
          </div>
        )}

        {order.status === 'shipped' && (
          <div className="rounded-2xl border border-border bg-card p-4 mb-4 flex items-start gap-3">
            <Truck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-foreground">Your order is on the way</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Once it arrives, enter the delivery code from the seller to release payment.
              </p>
            </div>
          </div>
        )}

        {order.status === 'completed' && (
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-950/20 p-4 mb-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-emerald-800 dark:text-emerald-300">Order completed</p>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-400/70 mt-0.5">
                Thanks for using VendoorX. You can leave a review on the product page.
              </p>
            </div>
          </div>
        )}

        {order.status === 'cancelled' && (
          <div className="rounded-2xl border border-border bg-card p-4 mb-4 flex items-start gap-3">
            <AlertOctagon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-foreground">Order cancelled</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Any payment has been refunded to your VendoorX wallet.
              </p>
            </div>
          </div>
        )}

        {/* Floating chat — available from the moment the order exists,
            so buyer & seller can confirm logistics before payment too. */}
        {me && order.status !== 'cancelled' && (
          <OrderChat
            orderId={order.id}
            currentUserId={me}
            otherUserName={isBuyer ? 'Seller' : 'Buyer'}
            orderRef={shortId}
          />
        )}

        {/* Manage from list */}
        <div className="text-center">
          <Link
            href="/dashboard/orders"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Manage all orders
          </Link>
        </div>
      </div>
    </div>
  )
}
