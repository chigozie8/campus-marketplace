'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag, Package, RefreshCw, ChevronRight } from 'lucide-react'
import { useMyOrders } from '@/hooks/use-orders'
import { OrderStatusTracker, OrderStatusBadge } from '@/components/features/order-status-tracker'
import { Button } from '@/components/ui/button'
import type { BackendOrder } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'

function OrderCard({ order }: { order: BackendOrder }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      layout
      className="rounded-2xl border border-border/60 bg-card overflow-hidden"
    >
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full text-left p-4 sm:p-5 flex items-start gap-4"
      >
        {/* Product image */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-muted flex-shrink-0 overflow-hidden">
          {order.products?.image_url ? (
            <img src={order.products.image_url} alt={order.products.name} className="w-full h-full object-cover" />
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
                {order.products?.name ?? 'Product'}
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
          <motion.div
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
          <div className="space-y-3">
            {orders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}

            {data && data.meta.totalPages > 1 && (
              <p className="text-center text-xs text-muted-foreground pt-2">
                Page {data.meta.page} of {data.meta.totalPages}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
