'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, XCircle, Loader2, RotateCcw, ShoppingBag, ArrowLeft } from 'lucide-react'
import { ordersApi } from '@/lib/api'

type Status = 'loading' | 'success' | 'cancelled' | 'failed' | 'no_reference'

function CallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const reference = searchParams.get('reference') || searchParams.get('trxref')
  const [status, setStatus] = useState<Status>('loading')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    if (!reference) {
      setStatus('no_reference')
      return
    }

    ordersApi.verifyPayment(reference)
      .then(result => {
        const s = result.data.status
        const meta = (result.data as { status: string; metadata?: { order_id?: string } }).metadata
        if (meta?.order_id) setOrderId(meta.order_id)

        if (s === 'success') {
          setStatus('success')
        } else if (s === 'abandoned' || s === 'cancelled') {
          setStatus('cancelled')
        } else {
          setStatus('failed')
        }
      })
      .catch(() => setStatus('failed'))
  }, [reference])

  async function handleRetry() {
    if (!orderId) {
      router.push('/dashboard/orders')
      return
    }
    setRetrying(true)
    try {
      const result = await ordersApi.initializePayment(orderId)
      window.location.href = result.data.authorization_url
    } catch {
      router.push('/dashboard/orders')
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Checking your payment…</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">Payment Successful!</h1>
          <p className="text-muted-foreground text-sm mt-1">Your order has been confirmed and is being processed.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/orders"
            className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20"
          >
            Track Order
          </Link>
          <Link
            href="/marketplace"
            className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
          >
            Keep Shopping
          </Link>
        </div>
      </div>
    )
  }

  if (status === 'cancelled') {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
          <ArrowLeft className="w-10 h-10 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">Payment Cancelled</h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-xs">
            No problem — you cancelled the payment. Your order is still saved and waiting.
            You can complete payment anytime.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {retrying
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Opening…</>
              : <><RotateCcw className="w-4 h-4" /> Try Again</>
            }
          </button>
          <Link
            href="/dashboard/orders"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            My Orders
          </Link>
        </div>
        <Link
          href="/marketplace"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Go back to marketplace
        </Link>
      </div>
    )
  }

  if (status === 'no_reference') {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <ShoppingBag className="w-10 h-10 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">No Payment Found</h1>
          <p className="text-muted-foreground text-sm mt-1">
            We couldn't find a payment to verify. Check your orders for the latest status.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/orders"
            className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all"
          >
            My Orders
          </Link>
          <Link
            href="/marketplace"
            className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
          >
            Browse
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
        <XCircle className="w-10 h-10 text-red-500" />
      </div>
      <div>
        <h1 className="text-2xl font-black text-foreground">Payment Failed</h1>
        <p className="text-muted-foreground text-sm mt-1">Something went wrong with the payment. Your order is still pending.</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={handleRetry}
          disabled={retrying}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {retrying
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Opening…</>
            : <><RotateCcw className="w-4 h-4" /> Try Again</>
          }
        </button>
        <Link
          href="/dashboard/orders"
          className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          My Orders
        </Link>
      </div>
      <Link
        href="/marketplace"
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Go back to marketplace
      </Link>
    </div>
  )
}

export default function PaymentCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-primary" />}>
        <CallbackContent />
      </Suspense>
    </div>
  )
}
