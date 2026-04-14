'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, XCircle, Loader2, RotateCcw, ShoppingBag, ArrowLeft, ArrowRight, Download } from 'lucide-react'
import { ordersApi } from '@/lib/api'
import { toast } from 'sonner'

type Status = 'loading' | 'success' | 'cancelled' | 'failed' | 'no_reference'

const REDIRECT_SECONDS = 5

function CountdownRing({ seconds, total }: { seconds: number; total: number }) {
  const size = 64
  const stroke = 4
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const progress = (seconds / total) * circumference

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-emerald-100 dark:text-emerald-950"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="text-emerald-500 transition-all duration-1000 ease-linear"
        />
      </svg>
      <span className="absolute text-lg font-black text-emerald-600 dark:text-emerald-400 rotate-90">
        {seconds}
      </span>
    </div>
  )
}

function SuccessView({ orderId, reference, onGoNow }: { orderId: string | null; reference: string | null; onGoNow: () => void }) {
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS)
  const router = useRouter()
  const destination = orderId ? `/dashboard/orders/${orderId}` : '/dashboard/orders'

  useEffect(() => {
    if (countdown <= 0) {
      router.push(destination)
      return
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown, router, destination])

  return (
    <div className="flex flex-col items-center gap-6 text-center max-w-sm">
      <div className="w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center ring-4 ring-emerald-100 dark:ring-emerald-900/40">
        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
      </div>

      <div>
        <h1 className="text-2xl font-black text-foreground">Payment Successful!</h1>
        <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">
          Your order has been confirmed and the seller has been notified. You can track delivery from your orders page.
        </p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <CountdownRing seconds={countdown} total={REDIRECT_SECONDS} />
        <p className="text-xs text-muted-foreground">
          Taking you to your order in <span className="font-bold text-foreground">{countdown}s</span>…
        </p>
      </div>

      <div className="flex gap-3 w-full">
        <button
          onClick={onGoNow}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20"
        >
          Track Order <ArrowRight className="w-4 h-4" />
        </button>
        <Link
          href="/marketplace"
          className="flex-1 flex items-center justify-center px-5 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
        >
          Keep Shopping
        </Link>
      </div>

      {reference && (
        <a
          href={`/receipt/${reference}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-400 text-sm font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download Receipt
        </a>
      )}
    </div>
  )
}

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
        const d = result.data as { status: string; order_id?: string | null; metadata?: { order_id?: string } }
        const s = d.status
        const oid = d.order_id || d.metadata?.order_id || null
        if (oid) setOrderId(oid)

        if (s === 'success') {
          setStatus('success')
          toast.success('Payment confirmed! Your order is now active.', { duration: 6000 })
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
      setRetrying(false)
      router.push('/dashboard/orders')
    }
  }

  function handleGoNow() {
    const destination = orderId ? `/dashboard/orders/${orderId}` : '/dashboard/orders'
    router.push(destination)
  }

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
        <div className="text-center">
          <p className="font-semibold text-foreground text-sm">Verifying your payment…</p>
          <p className="text-muted-foreground text-xs mt-0.5">This takes just a moment</p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return <SuccessView orderId={orderId} reference={reference} onGoNow={handleGoNow} />
  }

  if (status === 'cancelled') {
    return (
      <div className="flex flex-col items-center gap-5 text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
          <ArrowLeft className="w-10 h-10 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">Payment Cancelled</h1>
          <p className="text-muted-foreground text-sm mt-1 leading-relaxed max-w-xs">
            No problem — your order is still saved. You can complete payment anytime from your orders page.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
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
          ← Back to marketplace
        </Link>
      </div>
    )
  }

  if (status === 'no_reference') {
    return (
      <div className="flex flex-col items-center gap-5 text-center max-w-sm">
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
    <div className="flex flex-col items-center gap-5 text-center max-w-sm">
      <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
        <XCircle className="w-10 h-10 text-red-500" />
      </div>
      <div>
        <h1 className="text-2xl font-black text-foreground">Payment Failed</h1>
        <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
          Something went wrong. Don't worry — your order is still pending and no money was charged.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full">
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
        ← Back to marketplace
      </Link>
    </div>
  )
}

export default function PaymentCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      }>
        <CallbackContent />
      </Suspense>
    </div>
  )
}
