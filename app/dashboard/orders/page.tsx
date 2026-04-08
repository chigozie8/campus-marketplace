'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag, Package, RefreshCw, ChevronRight, AlertOctagon, Loader2, Wallet, CheckCircle2, Timer, Shield } from 'lucide-react'
import { useMyOrders } from '@/hooks/use-orders'
import { OrderStatusTracker, OrderStatusBadge } from '@/components/features/order-status-tracker'
import { Button } from '@/components/ui/button'
import type { BackendOrder } from '@/lib/api'
import { m, LazyMotion, domAnimation, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

async function getToken() {
  const supabase = createClient()
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

const AUTO_RELEASE_HOURS = 48

function useCountdown(deliveredAt: string | undefined) {
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    if (!deliveredAt) return
    function tick() {
      const deadline = new Date(deliveredAt!).getTime() + AUTO_RELEASE_HOURS * 60 * 60 * 1000
      const diff = deadline - Date.now()
      setRemaining(Math.max(0, diff))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [deliveredAt])

  return remaining
}

function formatCountdown(ms: number) {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) return `${hours}h ${minutes}m remaining`
  if (minutes > 0) return `${minutes}m ${seconds}s remaining`
  return `${seconds}s remaining`
}

function ConfirmDeliverySection({ order, onConfirmed }: { order: BackendOrder; onConfirmed: () => void }) {
  const [showDialog, setShowDialog] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const remaining = useCountdown(order.delivered_at ?? order.updated_at)

  if (confirmed || order.status !== 'delivered') return null

  async function handleConfirm() {
    setConfirming(true)
    try {
      const token = await getToken()
      const res = await fetch(`/api/backend/orders/${order.id}/confirm-delivery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Confirmation failed')
      toast.success('Delivery confirmed! Funds released to the seller.')
      setConfirmed(true)
      setShowDialog(false)
      onConfirmed()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-950/20 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
          Received your order? Release payment to the seller.
        </p>
      </div>

      {remaining !== null && remaining > 0 && (
        <div className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400">
          <Timer className="w-3.5 h-3.5 shrink-0" />
          <span>Auto-release in <span className="font-bold tabular-nums">{formatCountdown(remaining)}</span> if you don&apos;t confirm</span>
        </div>
      )}
      {remaining === 0 && (
        <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
          Auto-release period has ended — funds have been automatically released to the seller.
        </p>
      )}

      {!showDialog ? (
        <button
          onClick={() => setShowDialog(true)}
          className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-bold transition-all shadow-md shadow-emerald-500/20"
        >
          <CheckCircle2 className="w-4 h-4" />
          Confirm Delivery
        </button>
      ) : (
        <div className="space-y-2.5">
          <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
            By confirming, you release <span className="font-bold">₦{order.total_amount.toLocaleString()}</span> to the seller. Only confirm if you&apos;ve received your item in good condition.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDialog(false)}
              className="flex-1 h-9 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="flex-1 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              {confirming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Yes, I got it!
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function OrderCard({ order, onRefund, onDeliveryConfirmed }: { order: BackendOrder; onRefund: (id: string) => void; onDeliveryConfirmed: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [requestingRefund, setRequestingRefund] = useState(false)
  const [refundReason, setRefundReason] = useState('')
  const [showRefundForm, setShowRefundForm] = useState(false)
  const [refundDone, setRefundDone] = useState(false)

  const canRefund = ['paid', 'pending', 'shipped'].includes(order.status) && !refundDone

  async function handleRefundSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!refundReason.trim()) { toast.error('Please provide a reason'); return }
    setRequestingRefund(true)
    try {
      const token = await getToken()
      const res = await fetch(`/api/backend/wallets/refund/${order.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reason: refundReason.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Refund request failed')
      toast.success('Refund request submitted!')
      setRefundDone(true)
      setShowRefundForm(false)
      onRefund(order.id)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to request refund')
    } finally {
      setRequestingRefund(false)
    }
  }

  return (
    <m.div
      layout
      className="rounded-2xl border border-border/60 bg-card overflow-hidden"
    >
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full text-left p-4 sm:p-5 flex items-start gap-4"
      >
        {/* Product image */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-muted flex-shrink-0 overflow-hidden">
          {order.products?.images?.[0] ?? order.products?.image_url ? (
            <img src={order.products?.images?.[0] ?? order.products?.image_url!} alt={order.products?.title ?? order.products?.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-sm sm:text-base line-clamp-1">
                {order.products?.title ?? order.products?.name ?? 'Product'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(order.created_at).toLocaleDateString('en-NG', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
                {' · '}Qty: {order.quantity}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <span className="font-black text-sm text-foreground">
                ₦{order.total_amount.toLocaleString()}
              </span>
              <OrderStatusBadge status={order.status} />
            </div>
          </div>

          {/* Compact tracker */}
          <div className="mt-3">
            <OrderStatusTracker status={order.status} compact />
          </div>
        </div>

        <ChevronRight
          className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform mt-1 ${expanded ? 'rotate-90' : ''}`}
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-5 space-y-5 border-t border-border/50 pt-4">
              {/* Full tracker */}
              <OrderStatusTracker status={order.status} />

              {/* Order details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-0.5">Order ID</p>
                  <p className="font-mono text-xs font-semibold truncate">{order.id.split('-')[0]}…</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-0.5">Total Paid</p>
                  <p className="font-black text-primary">₦{order.total_amount.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50 col-span-2">
                  <p className="text-xs text-muted-foreground mb-0.5">Delivery Address</p>
                  <p className="text-xs font-medium">{order.delivery_address}</p>
                </div>
              </div>

              {/* Pay button for pending orders */}
              {order.status === 'pending' && (
                <Link
                  href={`/dashboard/orders/${order.id}/pay`}
                  className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20"
                >
                  Complete Payment →
                </Link>
              )}

              {/* Confirm delivery */}
              <ConfirmDeliverySection order={order} onConfirmed={onDeliveryConfirmed} />

              {/* Refund request */}
              {canRefund && !showRefundForm && (
                <button
                  onClick={() => setShowRefundForm(true)}
                  className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors font-semibold"
                >
                  <AlertOctagon className="w-3.5 h-3.5" />
                  Request a refund
                </button>
              )}

              {showRefundForm && (
                <div className="rounded-xl border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-950/20 p-4">
                  <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-3">Request a Refund</p>
                  <form onSubmit={handleRefundSubmit} className="space-y-3">
                    <textarea
                      value={refundReason}
                      onChange={e => setRefundReason(e.target.value)}
                      placeholder="Describe the issue — e.g. Seller hasn't responded, item not as described…"
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-xl border border-red-200 dark:border-red-700/40 bg-white dark:bg-card text-xs resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
                    />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setShowRefundForm(false)} className="flex-1 h-8 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors">
                        Cancel
                      </button>
                      <button type="submit" disabled={requestingRefund} className="flex-1 h-8 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60">
                        {requestingRefund && <Loader2 className="w-3 h-3 animate-spin" />}
                        Submit Refund
                      </button>
                    </div>
                  </form>
                  <p className="text-[10px] text-red-500/70 mt-2 leading-relaxed">
                    Refunds are processed within 3–5 business days. The seller&apos;s earnings will be held until reviewed.
                  </p>
                </div>
              )}

              {refundDone && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30">
                  <span className="text-xs text-green-700 dark:text-green-400 font-semibold">Refund request submitted — we&apos;ll be in touch within 3–5 business days.</span>
                </div>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  )
}

function OrdersSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-2xl border border-border/50 bg-card p-5 animate-pulse">
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-xl bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-3 bg-muted rounded w-1/3" />
              <div className="h-2 bg-muted rounded w-full mt-3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function OrdersPage() {
  const { data, isLoading, isError, refetch, isFetching } = useMyOrders()
  const orders = data?.data ?? []

  function handleRefund(_id: string) {
    refetch()
  }

  function handleDeliveryConfirmed() {
    refetch()
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-28">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/dashboard"
            className="w-9 h-9 rounded-xl border border-border/60 flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-black text-foreground">My Orders</h1>
            <p className="text-xs text-muted-foreground">Track and manage your orders</p>
          </div>
          <Link
            href="/dashboard/wallet"
            className="w-9 h-9 rounded-xl border border-border/60 flex items-center justify-center hover:bg-muted transition-colors"
            title="My Wallet"
          >
            <Wallet className="w-4 h-4" />
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-xl"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <OrdersSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-destructive/60" />
            </div>
            <h3 className="font-bold text-foreground mb-1">Failed to load orders</h3>
            <p className="text-sm text-muted-foreground mb-4">Make sure the backend API is running</p>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="rounded-xl">
              Try again
            </Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-5">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-black text-foreground mb-2">No orders yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              When you place an order, it will appear here with real-time tracking.
            </p>
            <Link
              href="/marketplace"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <LazyMotion features={domAnimation}>
            <div className="space-y-3">
              {orders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onRefund={handleRefund}
                  onDeliveryConfirmed={handleDeliveryConfirmed}
                />
              ))}

              {data && data.meta.totalPages > 1 && (
                <p className="text-center text-xs text-muted-foreground pt-2">
                  Page {data.meta.page} of {data.meta.totalPages}
                </p>
              )}
            </div>
          </LazyMotion>
        )}
      </div>
    </div>
  )
}
