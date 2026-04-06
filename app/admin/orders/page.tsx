import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminOrdersTable } from '@/components/admin/admin-orders-table'
import { Package, CircleDollarSign, Clock, CheckCircle2, XCircle } from 'lucide-react'

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id, quantity, total_amount, status, payment_status, payment_ref,
      delivery_address, notes, created_at,
      buyer:profiles!orders_buyer_id_fkey(id, full_name, phone, university),
      seller:profiles!orders_seller_id_fkey(id, full_name, phone),
      product:products(id, title, price, images)
    `)
    .order('created_at', { ascending: false })

  const all = orders ?? []
  const totalRevenue = all.reduce((s: number, o: any) => s + Number(o.total_amount ?? 0), 0)
  const pending = all.filter((o: any) => o.status === 'pending').length
  const completed = all.filter((o: any) => o.status === 'completed').length
  const cancelled = all.filter((o: any) => o.status === 'cancelled').length

  const summaryCards = [
    { label: 'Total Orders',  value: all.length,   icon: Package,         color: 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400' },
    { label: 'Revenue',       value: `₦${totalRevenue.toLocaleString()}`, icon: CircleDollarSign, color: 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400' },
    { label: 'Pending',       value: pending,       icon: Clock,           color: 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400' },
    { label: 'Completed',     value: completed,     icon: CheckCircle2,    color: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' },
    { label: 'Cancelled',     value: cancelled,     icon: XCircle,         color: 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div>
        <h2 className="text-lg font-black text-foreground tracking-tight">Orders</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {all.length} total {all.length === 1 ? 'order' : 'orders'}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {summaryCards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-card border border-border rounded-2xl p-4"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-xl font-black text-foreground tabular-nums">{value}</p>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <AdminOrdersTable orders={all} />
    </div>
  )
}
