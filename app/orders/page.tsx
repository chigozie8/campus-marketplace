'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, ShoppingBag, Loader2, Package,
  CheckCircle, Clock, Truck, XCircle, ChevronRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Order {
  id: string
  status: string
  amount: number
  currency: string
  notes: string | null
  created_at: string
  updated_at: string
  products: {
    id: string
    title: string
    images: string[] | null
    price: number
  } | null
  seller_profiles: {
    full_name: string | null
  } | null
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:   { label: 'Pending',   color: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400', icon: Clock },
  paid:      { label: 'Paid',      color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400', icon: CheckCircle },
  shipped:   { label: 'Shipped',   color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400', icon: CheckCircle },
  completed: { label: 'Completed', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400', icon: XCircle },
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  return new Date(dateStr).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })
}

const TABS = ['All', 'Active', 'Completed', 'Cancelled'] as const
type Tab = typeof TABS[number]

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('All')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      supabase
        .from('orders')
        .select(`
          *,
          products(id, title, images, price),
          seller_profiles:profiles!orders_seller_id_fkey(full_name)
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          setOrders((data as Order[]) || [])
          setLoading(false)
        })
    })
  }, [router])

  const filtered = orders.filter(o => {
    if (tab === 'All') return true
    if (tab === 'Active') return ['pending', 'paid', 'shipped', 'delivered'].includes(o.status)
    if (tab === 'Completed') return o.status === 'completed'
    if (tab === 'Cancelled') return o.status === 'cancelled'
    return true
  })

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-background">
      <header className="sticky top-0 z-40 bg-white dark:bg-card border-b border-gray-100 dark:border-border shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-black text-lg tracking-tight flex-1">My Orders</h1>
          <ShoppingBag className="w-5 h-5 text-primary" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-white dark:bg-card rounded-2xl p-1 mb-5 border border-gray-100 dark:border-border shadow-sm">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 text-xs font-bold py-2 rounded-xl transition-all ${tab === t ? 'bg-[#0a0a0a] text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 px-6">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-muted flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">No orders yet</h3>
            <p className="text-sm text-gray-500 dark:text-muted-foreground mb-6 max-w-xs mx-auto">
              When you place an order it will appear here.
            </p>
            <Link href="/marketplace" className="inline-flex items-center gap-2 bg-[#0a0a0a] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-all text-sm">
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(order => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
              const Icon = cfg.icon
              return (
                <div key={order.id} className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 p-4">
                    {/* Product image */}
                    <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-muted flex-shrink-0 overflow-hidden">
                      {order.products?.images?.[0] ? (
                        <img src={order.products.images[0]} alt={order.products.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {order.products?.title || 'Product'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">
                        Seller: {order.seller_profiles?.full_name || 'Unknown'}
                      </p>
                      <p className="text-base font-black text-gray-950 dark:text-white mt-1">
                        ₦{order.amount.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                      <span className="text-xs text-gray-400">{timeAgo(order.created_at)}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="border-t border-gray-50 dark:border-border px-4 py-2.5 flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    {order.products?.id && (
                      <Link
                        href={`/marketplace/${order.products.id}`}
                        className="flex items-center gap-0.5 text-xs text-primary font-semibold hover:underline"
                      >
                        View listing <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>

                  {order.notes && (
                    <div className="px-4 pb-3 -mt-1">
                      <p className="text-xs text-gray-500 bg-gray-50 dark:bg-muted rounded-xl px-3 py-2">{order.notes}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
