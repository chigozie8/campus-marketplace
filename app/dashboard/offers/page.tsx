'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Tag, ChevronRight, Inbox, Send, Loader2 } from 'lucide-react'

type OfferRow = {
  id: string
  offer_price: number
  status: 'pending' | 'accepted' | 'declined' | 'withdrawn' | 'countered'
  message: string | null
  created_at: string
  buyer_id: string
  seller_id: string
  products: { id: string; title: string; price: number; images: string[] | null } | null
  profiles?: { full_name: string | null } | null
}

const STATUS_BADGE: Record<OfferRow['status'], string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300',
  accepted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300',
  declined: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-300',
  withdrawn: 'bg-gray-100 text-gray-700 dark:bg-muted dark:text-muted-foreground',
  countered: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300',
}

export default function OffersPage() {
  const [tab, setTab] = useState<'received' | 'sent'>('received')
  const [offers, setOffers] = useState<OfferRow[]>([])
  const [loading, setLoading] = useState(true)

  async function load(t: 'received' | 'sent') {
    setLoading(true)
    try {
      const res = await fetch(`/api/offers?type=${t}`)
      const data = await res.json()
      setOffers(data.offers || [])
    } catch {
      setOffers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(tab) }, [tab])

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-background">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6 pb-28">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/dashboard"
            className="w-9 h-9 rounded-xl border border-border/60 flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-foreground">Offers</h1>
            <p className="text-xs text-muted-foreground">Negotiate prices with buyers and sellers</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted mb-5">
          <button
            onClick={() => setTab('received')}
            className={`h-10 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              tab === 'received' ? 'bg-white dark:bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            <Inbox className="w-4 h-4" />
            Received
          </button>
          <button
            onClick={() => setTab('sent')}
            className={`h-10 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              tab === 'sent' ? 'bg-white dark:bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            <Send className="w-4 h-4" />
            Sent
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white dark:bg-card rounded-2xl border border-border">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
              <Tag className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">No {tab} offers yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              {tab === 'received'
                ? 'When buyers make offers on your listings, they\'ll appear here.'
                : 'Browse the marketplace and make your first offer.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {offers.map(o => (
              <Link
                key={o.id}
                href={`/offers/${o.id}`}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-card border border-border hover:border-primary/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0 relative">
                  {o.products?.images?.[0] && (
                    <Image src={o.products.images[0]} alt={o.products.title} fill sizes="48px" className="object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-foreground truncate">{o.products?.title || 'Listing'}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                      {tab === 'received' ? `From ${o.profiles?.full_name || 'Buyer'}` : ''}
                    </span>
                    <span className="text-xs font-bold text-primary">₦{Number(o.offer_price).toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground line-through">
                      ₦{Number(o.products?.price ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full flex-shrink-0 ${STATUS_BADGE[o.status]}`}>
                  {o.status}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
