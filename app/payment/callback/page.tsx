'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { ordersApi } from '@/lib/api'

function CallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const reference = searchParams.get('reference') || searchParams.get('trxref')
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')

  useEffect(() => {
    if (!reference) {
      setStatus('failed')
      return
    }

    ordersApi.verifyPayment(reference)
      .then(result => {
        setStatus(result.data.status === 'success' ? 'success' : 'failed')
      })
      .catch(() => setStatus('failed'))
  }, [reference])

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Verifying your payment…</p>
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

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
        <XCircle className="w-10 h-10 text-red-500" />
      </div>
      <div>
        <h1 className="text-2xl font-black text-foreground">Payment Failed</h1>
        <p className="text-muted-foreground text-sm mt-1">Something went wrong. Your order is still pending.</p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/dashboard/orders"
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all"
        >
          View Orders
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

export default function PaymentCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-primary" />}>
        <CallbackContent />
      </Suspense>
    </div>
  )
}
