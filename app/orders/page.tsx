'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Package, CheckCircle, Clock, Truck, XCircle, ChevronRight, Search,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { VendorShell } from '@/components/vendor/vendor-shell'

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

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string; icon: React.ElementType }> = {
  pending:   { label: 'Pending',   dot: 'bg-yellow-400', color: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400', icon: Clock },
  paid:      { label: 'Paid',      dot: 'bg-blue-400',   color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400', icon: CheckCircle },
  shipped:   { label: 'Shipped',   dot: 'bg-purple-400', color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400', icon: Truck },
  delivered: { label: 'Delivered', dot: 'bg-green-400',  color: 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400', icon: CheckCircle },
  completed: { label: 'Completed', dot: 'bg-emerald-400',color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400', icon: CheckCircle },
  cancelled: { label: 'Cancelled', dot: 'bg-red-400',    color: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400', icon: XCircle },
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })
}

const TABS = ['All', 'Active', 'Completed', 'Cancelled'] as const
type Tab = typeof TABS[number]

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders]   = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState<Tab>('All')
  const [search, setSearch]   = useState('')
  const [initials, setInitials] = useState('?')
  const [fullName, setFullName] = useState('Vendor')
  const [email, setEmail]       = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setEmail(user.email || '')
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data: profile }) => {
          if (profile?.full_name) {
            setFullName(profile.full_name)
            setInitials(
              profile.full_name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
            )
          } else {
            setInitials(user.email?.charAt(0).toUpperCase() || '?')
          }
        })
      supabase
        .from('orders')
        .select('*, products(id, title, images, price), seller_profiles:profiles!orders_seller_id_fkey(full_name)')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => { setOrders((data as Order[]) || []); setLoading(false) })
    })
  }, [router])

  const filtered = orders.filter(o => {
    const matchTab = tab === 'All' ? true
      : tab === 'Active' ? ['pending', 'paid', 'shipped', 'delivered'].includes(o.status)
      : tab === 'Completed' ? o.status === 'completed'
      : o.status === 'cancelled'
    const matchSearch = search
      ? (o.products?.title || '').toLowerCase().includes(search.toLowerCase()) ||
        o.id.toLowerCase().includes(search.toLowerCase())
      : true
    return matchTab && matchSearch
  })

  const totalSpent = orders
    .filter(o => ['paid', 'delivered', 'completed'].includes(o.status))
    .reduce((s, o) => s + o.amount, 0)

  return (
    <VendorShell initials={initials} fullName={fullName} email={email} pageTitle="My Orders">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-10">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total Orders', value: orders.length },
            { label: 'Active', value: orders.filter(o => ['pending','paid','shipped','delivered'].includes(o.status)).length, color: 'text-blue-600' },
            { label: 'Spent', value: `₦${totalSpent.toLocaleString()}`, color: 'text-emerald-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-4 shadow-sm">
              <p className={`text-xl font-black ${color || 'text-gray-950 dark:text-white'}`}>{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Search + tabs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search orders…"
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>
          <div className="flex items-center gap-1 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl p-1">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`text-xs font-bold px-3 py-2 rounded-lg transition-all ${tab === t ? 'bg-gray-950 text-white shadow' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm text-center py-16 px-6">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-muted flex items-center justify-center mx-auto mb-4">
              <Package className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">No orders found</h3>
            <p className="text-xs text-gray-400 mb-5">
              {search ? 'Try a different search term' : 'When you place an order it will appear here'}
            </p>
            {!search && (
              <Link href="/marketplace" className="inline-flex items-center gap-2 bg-gray-950 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-all text-xs">
                Browse Marketplace
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-border">
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Order</th>
                  <th className="text-left px-3 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Seller</th>
                  <th className="text-left px-3 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-3 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-3 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-border">
                {filtered.map(order => {
                  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                  const Icon = cfg.icon
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/70 dark:hover:bg-muted/20 transition-colors group">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-muted flex-shrink-0 overflow-hidden">
                            {order.products?.images?.[0]
                              ? <img src={order.products.images[0]} alt={order.products.title} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-gray-400" /></div>
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white text-xs truncate max-w-[120px]">
                              {order.products?.title || 'Product'}
                            </p>
                            <p className="text-[10px] text-gray-400">#{order.id.slice(0, 8).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 hidden sm:table-cell">
                        <span className="text-xs text-gray-600 dark:text-muted-foreground">
                          {order.seller_profiles?.full_name || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-bold text-xs text-gray-950 dark:text-white">₦{order.amount.toLocaleString()}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 hidden md:table-cell">
                        <span className="text-xs text-gray-400">{timeAgo(order.created_at)}</span>
                      </td>
                      <td className="px-3 py-3">
                        {order.products?.id && (
                          <Link href={`/marketplace/${order.products.id}`}
                            className="flex items-center gap-0.5 text-[11px] text-primary font-semibold hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                            View <ChevronRight className="w-3 h-3" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </VendorShell>
  )
}
