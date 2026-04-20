'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ShieldAlert, Loader2, CheckCircle2, XCircle, Clock, ChevronRight } from 'lucide-react'

type DisputeStatus = 'open' | 'resolved_buyer' | 'resolved_seller' | 'cancelled'

type DisputeRow = {
  id: string
  order_id: string
  buyer_id: string
  seller_id: string
  reason: string
  evidence: string | null
  status: DisputeStatus
  admin_note: string | null
  resolved_at: string | null
  created_at: string
  amount: number | null
  orders: {
    id: string
    total_amount: number
    status: string
    products: { id: string; title: string; images: string[] | null } | null
  } | null
}

const STATUS_META: Record<DisputeStatus, { label: string; className: string; icon: React.ReactNode }> = {
  open: { label: 'Under review', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300', icon: <Clock className="w-3 h-3" /> },
  resolved_buyer: { label: 'Refunded', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300', icon: <CheckCircle2 className="w-3 h-3" /> },
  resolved_seller: { label: 'Released to seller', className: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300', icon: <CheckCircle2 className="w-3 h-3" /> },
  cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-700 dark:bg-muted dark:text-muted-foreground', icon: <XCircle className="w-3 h-3" /> },
}

export default function MyDisputesPage() {
  const [tab, setTab] = useState<'all' | 'buyer' | 'seller'>('all')
  const [disputes, setDisputes] = useState<DisputeRow[]>([])
  const [me, setMe] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function load(role: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/disputes/mine?role=${role}`)
      const json = await res.json()
      setDisputes(json.disputes || [])
      setMe(json.me || null)
    } catch {
      setDisputes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(tab) }, [tab])

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-background">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6 pb-28">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="w-9 h-9 rounded-xl border border-border/60 flex items-center justify-center hover:bg-muted transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-foreground">Disputes</h1>
            <p className="text-xs text-muted-foreground">Refund requests &amp; problem reports</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-muted mb-5">
          {(['all', 'buyer', 'seller'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`h-10 rounded-lg text-xs font-bold capitalize transition-colors ${
                tab === t ? 'bg-white dark:bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              {t === 'all' ? 'All' : t === 'buyer' ? 'I filed' : 'Against me'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : disputes.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white dark:bg-card rounded-2xl border border-border">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">No disputes</p>
            <p className="text-xs text-muted-foreground mt-1">
              {tab === 'buyer'
                ? "You haven't filed any disputes. If something goes wrong with an order, open one from the order details page."
                : tab === 'seller'
                  ? "No buyers have raised issues with your orders. Keep it up."
                  : "Disputes you file or receive will show up here."}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {disputes.map(d => {
              const meta = STATUS_META[d.status]
              const product = d.orders?.products
              const role = me === d.buyer_id ? 'buyer' : 'seller'
              const reasonLabel = d.reason.replace(/^\[[^\]]+\]\s*/, '')
              return (
                <Link
                  key={d.id}
                  href={`/dashboard/orders/${d.order_id}`}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-white dark:bg-card border border-border hover:border-primary/40 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0 relative">
                    {product?.images?.[0] && (
                      <Image src={product.images[0]} alt={product.title} fill sizes="48px" className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-sm text-foreground line-clamp-1">{product?.title || 'Order'}</p>
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 flex-shrink-0 ${meta.className}`}>
                        {meta.icon}
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{reasonLabel}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                      <span className="uppercase font-bold">{role === 'buyer' ? 'You filed' : 'Filed against you'}</span>
                      <span>·</span>
                      <span>{new Date(d.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      {d.amount != null && <><span>·</span><span className="font-bold">₦{Number(d.amount).toLocaleString()}</span></>}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
