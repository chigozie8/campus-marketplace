'use client'

import { useState, useTransition } from 'react'
import { Search, Package, Eye, X, Loader2, Download, CheckCircle2, RotateCcw, KeyRound } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Order {
  id: string
  quantity: number
  total_amount: number
  status: string
  payment_status: string
  payment_ref: string | null
  delivery_address: string | null
  notes: string | null
  created_at: string
  buyer: { id: string; full_name: string | null; phone: string | null; university: string | null } | null
  seller: { id: string; full_name: string | null; phone: string | null } | null
  product: { id: string; title: string; price: number; images: string[] | null } | null
}

interface Props { orders: Order[] }

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300',
  paid:      'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
  shipped:   'bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300',
  delivered: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300',
  completed: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
  cancelled: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
  disputed:  'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
}

const PAYMENT_COLORS: Record<string, string> = {
  unpaid: 'bg-gray-100 dark:bg-gray-800 text-gray-500',
  paid:   'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300',
  refunded:'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
}

export function AdminOrdersTable({ orders }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [selected, setSelected] = useState<Order | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [showRefundForm, setShowRefundForm] = useState(false)
  const [refundTo, setRefundTo] = useState<'buyer' | 'seller'>('buyer')
  const [refundReason, setRefundReason] = useState('')
  const [refunding, setRefunding] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)

  async function handleSendDeliveryOtp(orderId: string) {
    setSendingOtp(true)
    try {
      const res = await fetch(`/api/backend/delivery-otp/${orderId}/request?channel=both`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to send delivery code')
      }
      toast.success(data.message ?? 'Delivery code sent to buyer')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send delivery code')
    } finally {
      setSendingOtp(false)
    }
  }

  const filtered = orders.filter(o => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      o.id.toLowerCase().includes(q) ||
      (o.buyer?.full_name ?? '').toLowerCase().includes(q) ||
      (o.seller?.full_name ?? '').toLowerCase().includes(q) ||
      (o.product?.title ?? '').toLowerCase().includes(q) ||
      (o.payment_ref ?? '').toLowerCase().includes(q)

    const matchStatus  = statusFilter  === 'all' || o.status === statusFilter
    const matchPayment = paymentFilter === 'all' || o.payment_status === paymentFilter
    return matchSearch && matchStatus && matchPayment
  })

  async function handleDirectRefund(orderId: string) {
    if (!refundReason.trim()) { toast.error('Please provide a reason for the refund'); return }
    setRefunding(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refund_to: refundTo, reason: refundReason.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Refund failed')
      toast.success(data.message ?? 'Refund processed')
      setShowRefundForm(false)
      setRefundReason('')
      if (selected) setSelected(prev => prev ? { ...prev, status: 'cancelled' } : null)
      startTransition(() => router.refresh())
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Refund failed')
    } finally {
      setRefunding(false)
    }
  }

  async function updateStatus(orderId: string, status: string) {
    setUpdatingId(orderId)
    await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId, status }),
    })
    setUpdatingId(null)
    if (selected?.id === orderId) setSelected(prev => prev ? { ...prev, status } : null)
    startTransition(() => router.refresh())
  }

  function exportCSV() {
    const rows = [
      ['ID', 'Buyer', 'Seller', 'Product', 'Qty', 'Total', 'Status', 'Payment', 'Ref', 'Date'],
      ...filtered.map(o => [
        o.id,
        o.buyer?.full_name ?? '',
        o.seller?.full_name ?? '',
        o.product?.title ?? '',
        o.quantity,
        o.total_amount,
        o.status,
        o.payment_status,
        o.payment_ref ?? '',
        new Date(o.created_at).toLocaleDateString(),
      ]),
    ]
    const csv = rows.map(r => r.map(String).map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const STATUS_FILTERS  = ['all', 'pending', 'paid', 'shipped', 'delivered', 'completed', 'cancelled', 'disputed']
  const PAYMENT_FILTERS = ['all', 'unpaid', 'paid', 'refunded']

  return (
    <div className="flex gap-4">
      <div className={`bg-card border border-border rounded-2xl overflow-hidden flex-1 min-w-0 transition-all ${selected ? 'lg:max-w-[calc(100%-360px)]' : ''}`}>
        {/* Toolbar */}
        <div className="flex flex-col gap-3 p-4 border-b border-border">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search buyer, seller, product, ref..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-background border border-border rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all flex-shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
          <div className="flex gap-1 flex-wrap">
            {STATUS_FILTERS.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl capitalize transition-all ${
                  statusFilter === s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background border border-border text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >{s}</button>
            ))}
            <div className="w-px bg-border mx-1" />
            {PAYMENT_FILTERS.map(s => (
              <button key={s} onClick={() => setPaymentFilter(s)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl capitalize transition-all ${
                  paymentFilter === s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background border border-border text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >{s}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Product</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Buyer</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Seller</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Payment</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No orders found
                </td></tr>
              ) : filtered.map(o => (
                <tr key={o.id} className={`hover:bg-muted/30 transition-colors ${selected?.id === o.id ? 'bg-primary/5' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                        {o.product?.images?.[0]
                          ? <img src={o.product.images[0]} alt="" className="w-full h-full object-cover" />
                          : <Package className="w-4 h-4 text-muted-foreground m-auto mt-2.5" />
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate max-w-[140px]">{o.product?.title ?? 'Deleted product'}</p>
                        <p className="text-[11px] text-muted-foreground">Qty: {o.quantity}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="font-medium text-foreground">{o.buyer?.full_name ?? '—'}</p>
                    <p className="text-[11px] text-muted-foreground">{o.buyer?.university ?? ''}</p>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <p className="font-medium text-foreground">{o.seller?.full_name ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-foreground">
                    ₦{Number(o.total_amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[o.status] ?? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center hidden md:table-cell">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${PAYMENT_COLORS[o.payment_status] ?? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                      {o.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelected(selected?.id === o.id ? null : o)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} of {orders.length} orders
          </p>
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="hidden lg:flex flex-col w-[340px] flex-shrink-0 bg-card border border-border rounded-2xl overflow-hidden h-fit sticky top-4">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-black text-sm text-foreground">Order Details</h3>
            <button
              onClick={() => setSelected(null)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5 space-y-4 overflow-y-auto max-h-[80vh]">
            {/* Product */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                {selected.product?.images?.[0]
                  ? <img src={selected.product.images[0]} alt="" className="w-full h-full object-cover" />
                  : <Package className="w-5 h-5 text-muted-foreground m-auto mt-3.5" />
                }
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">{selected.product?.title ?? 'Deleted product'}</p>
                <p className="text-xs text-muted-foreground">Qty: {selected.quantity} &bull; ₦{Number(selected.product?.price ?? 0).toLocaleString()} each</p>
              </div>
            </div>

            <div className="h-px bg-border" />

            <DetailRow label="Order ID" value={selected.id.slice(0, 13) + '...'} mono />
            <DetailRow label="Total Amount" value={`₦${Number(selected.total_amount).toLocaleString()}`} bold />
            <DetailRow label="Payment Ref" value={selected.payment_ref ?? 'N/A'} mono />
            <DetailRow label="Date" value={new Date(selected.created_at).toLocaleString()} />

            <div className="h-px bg-border" />

            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Buyer</p>
              <p className="text-sm font-semibold text-foreground">{selected.buyer?.full_name ?? '—'}</p>
              <p className="text-xs text-muted-foreground">{selected.buyer?.phone ?? 'No phone'}</p>
              <p className="text-xs text-muted-foreground">{selected.buyer?.university ?? ''}</p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Seller</p>
              <p className="text-sm font-semibold text-foreground">{selected.seller?.full_name ?? '—'}</p>
              <p className="text-xs text-muted-foreground">{selected.seller?.phone ?? 'No phone'}</p>
            </div>

            {selected.delivery_address && (
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Delivery Address</p>
                <p className="text-sm text-foreground">{selected.delivery_address}</p>
              </div>
            )}

            {selected.notes && (
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
                <p className="text-sm text-foreground">{selected.notes}</p>
              </div>
            )}

            <div className="h-px bg-border" />

            {/* Send / resend delivery OTP — only meaningful once shipped */}
            {(selected.status === 'shipped' || selected.status === 'delivered') && (
              <div className="rounded-xl border border-blue-200 dark:border-blue-800/40 bg-blue-50 dark:bg-blue-950/20 p-3">
                <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-2">Delivery Code</p>
                <p className="text-[11px] text-blue-800 dark:text-blue-300 mb-3 leading-relaxed">
                  Generate a new code and send it to the buyer via email, SMS, and their in-app bell. Use this if the buyer says they never received the original code.
                </p>
                <button
                  onClick={() => handleSendDeliveryOtp(selected.id)}
                  disabled={sendingOtp}
                  className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  {sendingOtp
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending…</>
                    : <><KeyRound className="w-3.5 h-3.5" /> Send Delivery Code to Buyer</>
                  }
                </button>
              </div>
            )}

            {/* Manual completion for delivered orders (dispute resolution) */}
            {selected.status === 'delivered' && (
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-950/20 p-3">
                <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">Escrow Release</p>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mb-3 leading-relaxed">
                  Order is in delivered state. Manually mark as completed to release escrow funds to the seller (use during dispute resolution).
                </p>
                <button
                  onClick={() => updateStatus(selected.id, 'completed')}
                  disabled={updatingId === selected.id}
                  className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  {updatingId === selected.id
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <><CheckCircle2 className="w-3.5 h-3.5" /> Mark as Completed & Release Funds</>
                  }
                </button>
              </div>
            )}

            {/* Direct Admin Refund */}
            {!showRefundForm ? (
              <div>
                <div className="h-px bg-border" />
                <button
                  onClick={() => setShowRefundForm(true)}
                  className="flex items-center gap-2 w-full py-2 px-3 rounded-xl border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Direct Admin Refund
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-950/10 p-3 space-y-2.5">
                <p className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">Direct Refund</p>
                <div className="flex gap-1.5">
                  {(['buyer', 'seller'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setRefundTo(t)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                        refundTo === t
                          ? 'bg-red-500 text-white border-red-500'
                          : 'border-border text-muted-foreground hover:border-red-300'
                      }`}
                    >
                      Refund {t}
                    </button>
                  ))}
                </div>
                <textarea
                  value={refundReason}
                  onChange={e => setRefundReason(e.target.value)}
                  placeholder="Reason for refund (required)…"
                  rows={2}
                  className="w-full px-2.5 py-2 rounded-xl border border-red-200 dark:border-red-700/40 bg-white dark:bg-card text-xs resize-none outline-none focus:ring-2 focus:ring-red-300"
                />
                <p className="text-[10px] text-red-500/70 leading-relaxed">
                  This will credit ₦{Number(selected?.total_amount ?? 0).toLocaleString()} to the {refundTo}&apos;s wallet and cancel the order.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowRefundForm(false); setRefundReason('') }}
                    className="flex-1 py-1.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => selected && handleDirectRefund(selected.id)}
                    disabled={refunding || !refundReason.trim()}
                    className="flex-1 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    {refunding
                      ? <><Loader2 className="w-3 h-3 animate-spin" /> Processing…</>
                      : <><RotateCcw className="w-3 h-3" /> Issue Refund</>
                    }
                  </button>
                </div>
              </div>
            )}

            {/* Status updater */}
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Update Status</p>
              <div className="grid grid-cols-2 gap-2">
                {['pending', 'delivered', 'completed', 'cancelled', 'disputed'].map(s => (
                  <button
                    key={s}
                    onClick={() => updateStatus(selected.id, s)}
                    disabled={updatingId === selected.id || selected.status === s}
                    className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all disabled:opacity-40 ${
                      selected.status === s
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border border-border text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    {updatingId === selected.id && selected.status !== s
                      ? <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                      : s
                    }
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, value, mono, bold }: { label: string; value: string; mono?: boolean; bold?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-xs text-muted-foreground flex-shrink-0">{label}</span>
      <span className={`text-xs text-right break-all ${bold ? 'font-bold text-foreground' : 'text-foreground'} ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  )
}
