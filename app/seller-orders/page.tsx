'use client'

import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  Package, Truck, CheckCircle2, Clock, AlertCircle,
  ArrowLeft, Loader2, Store, ChevronRight,
  ShieldCheck, Banknote, RefreshCw,
} from 'lucide-react'
import { useVendorOrders } from '@/hooks/use-orders'
import { type BackendOrder, type OrderStatus, ordersApi } from '@/lib/api'
import { toast } from 'sonner'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { m, LazyMotion, domAnimation, AnimatePresence } from 'framer-motion'
import { TrustBadge } from '@/components/TrustBadge'
import { DashboardTrustPanel } from '@/components/dashboard/trust-panel'
import { OrderChat } from '@/components/features/order-chat'

async function getToken() {
  const supabase = createClient()
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

const STATUS_META: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: 'Pending Payment',  color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-800', icon: <Clock className="w-3.5 h-3.5" /> },
  paid:      { label: 'Paid — Ship Now',  color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200 dark:border-blue-800', icon: <Banknote className="w-3.5 h-3.5" /> },
  shipped:   { label: 'Shipped',          color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/30 dark:text-violet-400 border-violet-200 dark:border-violet-800', icon: <Truck className="w-3.5 h-3.5" /> },
  delivered: { label: 'Delivered',        color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/30 dark:text-teal-400 border-teal-200 dark:border-teal-800', icon: <Package className="w-3.5 h-3.5" /> },
  completed: { label: 'Completed',        color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  cancelled: { label: 'Cancelled',        color: 'text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-800', icon: <AlertCircle className="w-3.5 h-3.5" /> },
}

type ExtendedOrder = BackendOrder & {
  profiles?: { full_name: string }
  buyer_id?: string
}

type BuyerTrust = { score: number; level: string; totalDisputes?: number; completedOrders?: number }

function StatusBadge({ status }: { status: OrderStatus }) {
  const meta = STATUS_META[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${meta.color}`}>
      {meta.icon}
      {meta.label}
    </span>
  )
}

const DELIVERY_OPTIONS = [1, 2, 3, 5, 7, 10, 14, 21, 30] as const

function OrderCard({ order, onUpdate, currentUserId }: { order: ExtendedOrder; onUpdate: () => void; currentUserId?: string }) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [buyerTrust, setBuyerTrust] = useState<BuyerTrust | null>(null)
  const [trustLoading, setTrustLoading] = useState(false)
  const [savingDuration, setSavingDuration] = useState(false)
  const [duration, setDuration] = useState<number>(order.delivery_duration_days ?? 5)

  async function saveDuration(days: number) {
    if (savingDuration) return
    setSavingDuration(true)
    try {
      await ordersApi.setDeliveryDuration(order.id, days)
      setDuration(days)
      toast.success(`Delivery window set to ${days} day${days === 1 ? '' : 's'}. Buyer notified.`)
      onUpdate()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save delivery window')
    } finally {
      setSavingDuration(false)
    }
  }

  useEffect(() => {
    if (!expanded || buyerTrust || !order.buyer_id) return
    setTrustLoading(true)
    fetch(`/api/trust-score/${order.buyer_id}`)
      .then(r => r.json())
      .then(d => {
        if (d.buyer) setBuyerTrust(d.buyer)
      })
      .catch(() => {})
      .finally(() => setTrustLoading(false))
  }, [expanded, order.buyer_id, buyerTrust])

  async function markStatus(newStatus: OrderStatus) {
    if (loading) return
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch(`/api/backend/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to update status')
      toast.success(`Order marked as ${newStatus}!`)
      onUpdate()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const buyerName = order.profiles?.full_name || 'Buyer'
  const productName = order.products?.title || order.products?.name || 'Product'
  const dateStr = new Date(order.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <m.div layout className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full text-left p-4 sm:p-5 flex items-start gap-4"
      >
        <div className="w-12 h-12 rounded-xl bg-muted flex-shrink-0 flex items-center justify-center">
          {order.products?.images?.[0] ? (
            <img src={order.products.images[0]} alt={productName} className="w-full h-full object-cover rounded-xl" />
          ) : (
            <Store className="w-5 h-5 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <p className="font-semibold text-sm line-clamp-1">{productName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {dateStr} · Qty: {order.quantity} · Buyer: <span className="font-medium text-foreground">{buyerName}</span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <span className="font-black text-sm text-primary">₦{order.total_amount.toLocaleString()}</span>
              <StatusBadge status={order.status} />
            </div>
          </div>
        </div>

        <ChevronRight className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform mt-1 ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Seller's only action is "Mark as Shipped". After that, escrow + the
          buyer's confirmation handle everything — sellers cannot mark items
          as delivered themselves (prevents fraudulent auto-release). */}
      {order.status === 'paid' && (
        <div className="px-4 sm:px-5 pb-4 -mt-1 space-y-3" onClick={(e) => e.stopPropagation()}>
          <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <p className="text-xs font-bold text-blue-800 dark:text-blue-300">
                Delivery window
                {order.delivery_duration_days != null && (
                  <span className="ml-1 font-normal text-blue-700/80 dark:text-blue-400/80">
                    · currently {order.delivery_duration_days} day{order.delivery_duration_days === 1 ? '' : 's'}
                  </span>
                )}
              </p>
            </div>
            <p className="text-[11px] text-blue-700/80 dark:text-blue-400/80 mb-2 leading-relaxed">
              Tell the buyer how long shipping will take. They&apos;ll get a notification, and the order auto-cancels if you don&apos;t ship in time. Default is 5 days.
            </p>
            <div className="flex items-center gap-2">
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                disabled={savingDuration}
                className="flex-1 h-9 px-2 text-xs rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 font-semibold disabled:opacity-60"
              >
                {DELIVERY_OPTIONS.map((d) => (
                  <option key={d} value={d}>{d} day{d === 1 ? '' : 's'}</option>
                ))}
              </select>
              <button
                onClick={() => saveDuration(duration)}
                disabled={savingDuration || duration === (order.delivery_duration_days ?? 5)}
                className="h-9 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-50 transition-colors flex items-center gap-1.5"
              >
                {savingDuration ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Save
              </button>
            </div>
          </div>

          <button
            onClick={() => markStatus('shipped')}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold transition-all disabled:opacity-60 shadow-md shadow-violet-500/25"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
            Mark as Shipped
          </button>
        </div>
      )}

      {(order.status === 'shipped' || order.status === 'delivered') && (
        <div className="px-4 sm:px-5 pb-4 -mt-1">
          <div className="rounded-xl bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 p-3 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-teal-800 dark:text-teal-300">
                Item on the way — escrow protects your payment.
              </p>
              <p className="text-[11px] text-teal-700/80 dark:text-teal-400/80 leading-relaxed">
                The buyer received their delivery code by email and SMS when you marked this shipped.
                Your money is released the moment they confirm receipt — or automatically after 24 hours if they don&apos;t.
              </p>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {expanded && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-5 space-y-4 border-t border-border/50 pt-4">

              {(buyerTrust || trustLoading) && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/60">
                  <div>
                    <p className="text-[11px] text-muted-foreground font-semibold mb-0.5">Buyer Trust Score</p>
                    {trustLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                    ) : buyerTrust ? (
                      <div className="flex items-center gap-2">
                        <TrustBadge score={buyerTrust.score} size="sm" />
                        {(buyerTrust.completedOrders !== undefined || buyerTrust.totalDisputes !== undefined) && (
                          <span className="text-[10px] text-muted-foreground">
                            {buyerTrust.completedOrders ?? 0} orders · {buyerTrust.totalDisputes ?? 0} dispute{(buyerTrust.totalDisputes ?? 0) !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    ) : null}
                  </div>
                  {buyerTrust && buyerTrust.score < 50 && (
                    <div className="flex items-center gap-1 text-[10px] text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-2 py-1 rounded-lg">
                      <AlertCircle className="w-3 h-3" />
                      Proceed with caution
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-muted/50">
                  <p className="text-[11px] text-muted-foreground mb-0.5">Order ID</p>
                  <p className="font-mono text-xs font-semibold truncate">{order.id.split('-')[0]}…</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50">
                  <p className="text-[11px] text-muted-foreground mb-0.5">Amount</p>
                  <p className="font-black text-primary text-sm">₦{order.total_amount.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50 col-span-2">
                  <p className="text-[11px] text-muted-foreground mb-0.5">Delivery Address</p>
                  <p className="text-xs font-medium">{order.delivery_address || '—'}</p>
                </div>
              </div>

              {order.status === 'paid' && (
                <div className="rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3">
                  <p className="text-xs text-blue-800 dark:text-blue-300 font-semibold">
                    Buyer has paid. Ship the item and tap “Mark as Shipped” above — the buyer will then receive a delivery code automatically.
                  </p>
                </div>
              )}

              {order.status === 'completed' && (
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-3 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                    Payment has been released to your wallet.
                  </p>
                </div>
              )}

              {/* Chat with buyer */}
              {currentUserId && order.buyer_id && (
                <div className="flex items-center gap-2 pt-1">
                  <OrderChat
                    orderId={order.id}
                    currentUserId={currentUserId}
                    otherUserName={buyerName}
                    orderRef={order.id.slice(0, 8).toUpperCase()}
                  />
                </div>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  )
}

const STATUS_FILTERS: Array<{ value: OrderStatus | 'all'; label: string }> = [
  { value: 'all',       label: 'All' },
  { value: 'paid',      label: 'Paid' },
  { value: 'shipped',   label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function SellerOrdersPage() {
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const [sellerId, setSellerId] = useState<string | null>(null)
  const qc = useQueryClient()
  const { data, isLoading, isError, error, refetch } = useVendorOrders(page)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setSellerId(data.user?.id ?? null))
  }, [])

  const orders = ((data?.data ?? []) as ExtendedOrder[]).filter(o =>
    filter === 'all' ? true : o.status === filter,
  )
  const meta = data?.meta

  function handleUpdate() {
    qc.invalidateQueries({ queryKey: ['orders', 'vendor'] })
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-background max-w-2xl mx-auto px-4 py-6">

        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-foreground">Seller Orders</h1>
            <p className="text-xs text-muted-foreground">Manage orders for your listings</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                filter === f.value
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <div className="text-center py-20 px-4">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground mb-1">Failed to load orders</p>
            <p className="text-xs text-muted-foreground mb-4 max-w-sm mx-auto break-words">
              {error instanceof Error ? error.message : 'Something went wrong. Please try again.'}
            </p>
            <button onClick={() => refetch()} className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold">Retry</button>
          </div>
        )}

        {!isLoading && !isError && orders.length === 0 && (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground mb-1">No orders yet</p>
            <p className="text-xs text-muted-foreground">
              {filter === 'all'
                ? "Orders from buyers will appear here once they start purchasing your listings."
                : `No ${filter} orders found.`}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {orders.map(order => (
            <OrderCard key={order.id} order={order} onUpdate={handleUpdate} currentUserId={sellerId ?? undefined} />
          ))}
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl bg-muted text-xs font-semibold disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs text-muted-foreground">
              Page {page} of {meta.totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages}
              className="px-4 py-2 rounded-xl bg-muted text-xs font-semibold disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}

        {sellerId && (
          <div className="mt-8">
            <DashboardTrustPanel userId={sellerId} isSeller={true} />
          </div>
        )}

        <div className="mt-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-foreground mb-1">Escrow Protection</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All payments are held in escrow. Mark orders as <strong>Shipped</strong> then <strong>Delivered</strong> — buyers confirm receipt to release your funds. If a buyer doesn't confirm within 24 hours of delivery, funds are automatically released to you.
              </p>
            </div>
          </div>
        </div>

      </div>
    </LazyMotion>
  )
}
