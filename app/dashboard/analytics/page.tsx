'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, TrendingUp, ShoppingBag, Package, Star,
  BarChart2, Loader2, RefreshCw, Eye, MessageCircle,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { VendorShell } from '@/components/vendor/vendor-shell'

interface Order {
  id: string
  status: string
  total_amount: number
  created_at: string
}

interface Product {
  id: string
  title: string
  views: number
  whatsapp_clicks: number
  price: number
  status: string
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n)
}

function groupByMonth(orders: Order[]) {
  const map: Record<string, number> = {}
  for (const o of orders) {
    const month = new Date(o.created_at).toLocaleDateString('en-NG', { month: 'short', year: '2-digit' })
    map[month] = (map[month] ?? 0) + o.total_amount
  }
  return Object.entries(map).slice(-6).map(([month, revenue]) => ({ month, revenue }))
}

function groupByStatus(orders: Order[]) {
  const map: Record<string, number> = {}
  for (const o of orders) {
    map[o.status] = (map[o.status] ?? 0) + 1
  }
  const colors: Record<string, string> = {
    pending: '#f59e0b',
    paid: '#3b82f6',
    shipped: '#8b5cf6',
    delivered: '#06b6d4',
    completed: '#10b981',
    cancelled: '#ef4444',
  }
  return Object.entries(map).map(([status, count]) => ({ status, count, fill: colors[status] ?? '#6b7280' }))
}

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const [ordersRes, productsRes] = await Promise.all([
      supabase
        .from('orders')
        .select('id, status, total_amount, created_at')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: true }),
      supabase
        .from('products')
        .select('id, title, views, whatsapp_clicks, price, status')
        .eq('seller_id', user.id)
        .order('views', { ascending: false }),
    ])

    setOrders((ordersRes.data ?? []) as Order[])
    setProducts((productsRes.data ?? []) as Product[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const completedOrders = orders.filter(o => o.status === 'completed')
  const totalRevenue = completedOrders.reduce((s, o) => s + o.total_amount, 0)
  const totalViews = products.reduce((s, p) => s + (p.views ?? 0), 0)
  const totalClicks = products.reduce((s, p) => s + (p.whatsapp_clicks ?? 0), 0)
  const conversionRate = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0'
  const completionRate = orders.length > 0 ? Math.round((completedOrders.length / orders.length) * 100) : 0

  const revenueData = groupByMonth(completedOrders)
  const statusData = groupByStatus(orders)

  const STATS = [
    { label: 'Total Revenue', value: fmt(totalRevenue), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'Total Orders', value: orders.length.toString(), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { label: 'Active Listings', value: products.filter(p => p.status === 'active').length.toString(), icon: Package, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30' },
    { label: 'Completion Rate', value: `${completionRate}%`, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    { label: 'Total Views', value: totalViews.toLocaleString(), icon: Eye, color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-950/30' },
    { label: 'WhatsApp Clicks', value: totalClicks.toLocaleString(), icon: MessageCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
    { label: 'Click Rate', value: `${conversionRate}%`, icon: BarChart2, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
  ]

  return (
    <VendorShell>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="p-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-black text-foreground">Analytics</h1>
            <p className="text-xs text-muted-foreground">Your store performance at a glance</p>
          </div>
          <button onClick={load} disabled={loading} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
              {STATS.map(s => {
                const Icon = s.icon
                return (
                  <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
                    <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-2.5`}>
                      <Icon className={`w-4 h-4 ${s.color}`} />
                    </div>
                    <p className="text-xl font-black text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                )
              })}
            </div>

            {/* Revenue over time */}
            {revenueData.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5 mb-4">
                <h2 className="text-sm font-black text-foreground mb-4">Revenue Over Time</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }}
                      formatter={(v: number) => [fmt(v), 'Revenue']}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#revenueGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Orders by status */}
            {statusData.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5 mb-4">
                <h2 className="text-sm font-black text-foreground mb-4">Orders by Status</h2>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={statusData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="status" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top listings */}
            {products.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <h2 className="text-sm font-black text-foreground mb-4">Top Listings by Views</h2>
                <div className="space-y-2.5">
                  {products.slice(0, 8).map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center text-[11px] font-black text-muted-foreground flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{p.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">{(p.views ?? 0).toLocaleString()} views</span>
                          <span className="text-[10px] text-muted-foreground">·</span>
                          <span className="text-[10px] text-muted-foreground">{(p.whatsapp_clicks ?? 0)} clicks</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-xs font-bold text-foreground">{fmt(p.price)}</p>
                        <p className={`text-[10px] font-bold ${p.status === 'active' ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                          {p.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {orders.length === 0 && products.length === 0 && (
              <div className="text-center py-16">
                <BarChart2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-semibold text-foreground">No data yet</p>
                <p className="text-sm text-muted-foreground mt-1">Your analytics will appear here once you start selling.</p>
                <Link
                  href="/products/new"
                  className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold text-primary hover:underline"
                >
                  Add your first listing <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </VendorShell>
  )
}
