'use client'

import { useState, useEffect, useRef, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, Loader2, Tag, Check, X, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

type OfferParty = { id: string; full_name: string | null; avatar_url: string | null }

type Offer = {
  id: string
  product_id: string
  buyer_id: string
  seller_id: string
  offer_price: number
  message: string | null
  status: 'pending' | 'accepted' | 'declined' | 'withdrawn' | 'countered'
  created_at: string
  products: { id: string; title: string; price: number; images: string[] | null } | null
  buyer: OfferParty | null
  seller: OfferParty | null
}

type Message = {
  id: string
  sender_id: string
  body: string | null
  counter_price: number | null
  created_at: string
}

const STATUS_BADGE: Record<Offer['status'], string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300',
  accepted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300',
  declined: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-300',
  withdrawn: 'bg-gray-100 text-gray-700 dark:bg-muted dark:text-muted-foreground',
  countered: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300',
}

export default function OfferConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [offer, setOffer] = useState<Offer | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [me, setMe] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reply, setReply] = useState('')
  const [counter, setCounter] = useState('')
  const [showCounter, setShowCounter] = useState(false)
  const [sending, setSending] = useState(false)
  const [updating, setUpdating] = useState<null | 'accept' | 'decline' | 'withdraw'>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  async function loadAll() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(`/auth/login?redirect=/offers/${id}`)
        return
      }
      setMe(user.id)

      const [offerRes, msgRes] = await Promise.all([
        fetch(`/api/offers/${id}`),
        fetch(`/api/offers/${id}/messages`),
      ])
      if (!offerRes.ok) {
        const j = await offerRes.json().catch(() => ({}))
        throw new Error(j.error || 'Failed to load offer')
      }
      const { offer: o } = await offerRes.json()
      setOffer(o)
      if (msgRes.ok) {
        const { messages: m } = await msgRes.json()
        setMessages(m)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
    const t = setInterval(() => {
      // Light polling for new messages — no realtime subscription required
      fetch(`/api/offers/${id}/messages`)
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d?.messages) setMessages(d.messages) })
        .catch(() => {})
    }, 5000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  async function send(opts?: { withCounter?: boolean }) {
    if (sending) return
    const body = reply.trim()
    const counterNum = opts?.withCounter ? Number(counter) : 0
    if (!body && !counterNum) {
      toast.error('Type a reply or enter a counter price')
      return
    }
    if (opts?.withCounter && (!counterNum || counterNum <= 0)) {
      toast.error('Enter a valid counter price')
      return
    }
    setSending(true)
    try {
      const res = await fetch(`/api/offers/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body, counterPrice: counterNum || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send')
      setMessages(prev => [...prev, data.message])
      setReply('')
      setCounter('')
      setShowCounter(false)
      if (counterNum) {
        // refresh offer to reflect 'countered' status
        loadAll()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Send failed')
    } finally {
      setSending(false)
    }
  }

  async function updateStatus(status: 'accepted' | 'declined' | 'withdrawn') {
    if (updating) return
    const label = status === 'accepted' ? 'accept' : status === 'declined' ? 'decline' : 'withdraw'
    setUpdating(label as typeof updating)
    try {
      const res = await fetch(`/api/offers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      toast.success(`Offer ${status}.`)
      loadAll()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-base font-bold text-foreground">{error || 'Offer not found'}</p>
        <Link href="/dashboard/offers" className="text-sm text-primary hover:underline">Back to offers</Link>
      </div>
    )
  }

  const iAmSeller = me === offer.seller_id
  const otherParty = iAmSeller ? offer.buyer : offer.seller
  const product = offer.products
  const canRespond = offer.status === 'pending' || offer.status === 'countered'

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] dark:bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-card border-b border-border">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 flex items-center gap-3">
          <Link
            href="/dashboard/offers"
            className="w-9 h-9 rounded-xl border border-border/60 flex items-center justify-center hover:bg-muted transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          {product && (
            <Link href={`/marketplace/${product.id}`} className="flex items-center gap-3 flex-1 min-w-0 group">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
                {product.images?.[0]
                  ? <Image src={product.images[0]} alt={product.title} fill className="object-cover" sizes="40px" />
                  : null
                }
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                  {product.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  with {otherParty?.full_name || (iAmSeller ? 'Buyer' : 'Seller')}
                </p>
              </div>
            </Link>
          )}
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full flex-shrink-0 ${STATUS_BADGE[offer.status]}`}>
            {offer.status}
          </span>
        </div>
      </div>

      {/* Summary card */}
      <div className="max-w-2xl mx-auto w-full px-3 sm:px-4 pt-4">
        <div className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Listing price</p>
            <p className="font-bold text-foreground">₦{(product?.price ?? 0).toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Initial offer</p>
            <p className="font-black text-primary">₦{Number(offer.offer_price).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 max-w-2xl mx-auto w-full px-3 sm:px-4 py-4 space-y-3 overflow-y-auto">
        {/* Initial offer as first "message" */}
        <MessageBubble
          mine={me === offer.buyer_id}
          name={offer.buyer?.full_name || 'Buyer'}
          time={offer.created_at}
        >
          <p className="text-sm">
            <Tag className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
            Offered <span className="font-black">₦{Number(offer.offer_price).toLocaleString()}</span>
          </p>
          {offer.message && <p className="text-sm mt-1.5">{offer.message}</p>}
        </MessageBubble>

        {messages.map(m => (
          <MessageBubble
            key={m.id}
            mine={m.sender_id === me}
            name={m.sender_id === offer.buyer_id ? (offer.buyer?.full_name || 'Buyer') : (offer.seller?.full_name || 'Seller')}
            time={m.created_at}
          >
            {m.counter_price != null && (
              <p className="text-sm">
                <RefreshCw className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
                Counter offer: <span className="font-black">₦{Number(m.counter_price).toLocaleString()}</span>
              </p>
            )}
            {m.body && <p className="text-sm whitespace-pre-wrap mt-1">{m.body}</p>}
          </MessageBubble>
        ))}

        {!canRespond && (
          <div className="text-center py-3">
            <p className="text-xs text-muted-foreground">
              This offer is <span className="font-bold">{offer.status}</span>. The conversation is closed.
            </p>
          </div>
        )}
      </div>

      {/* Composer */}
      {canRespond && (
        <div className="sticky bottom-0 bg-white dark:bg-card border-t border-border">
          <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 space-y-2.5">
            {showCounter && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30">
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 flex-shrink-0">Counter ₦</span>
                <input
                  type="number"
                  min={1}
                  value={counter}
                  onChange={e => setCounter(e.target.value)}
                  placeholder="New price"
                  className="flex-1 bg-transparent text-sm font-bold focus:outline-none placeholder:text-muted-foreground/50"
                />
                <button
                  onClick={() => { setShowCounter(false); setCounter('') }}
                  className="w-6 h-6 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5 text-blue-700 dark:text-blue-300" />
                </button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <textarea
                value={reply}
                onChange={e => setReply(e.target.value)}
                placeholder={iAmSeller ? 'Reply to the buyer…' : 'Reply to the seller…'}
                rows={1}
                className="flex-1 resize-none px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 max-h-32"
                onInput={e => {
                  const t = e.currentTarget
                  t.style.height = 'auto'
                  t.style.height = Math.min(t.scrollHeight, 128) + 'px'
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey && !showCounter) {
                    e.preventDefault()
                    send()
                  }
                }}
              />
              <button
                onClick={() => send({ withCounter: showCounter })}
                disabled={sending}
                className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-50 hover:bg-primary/90 transition-colors flex-shrink-0"
                aria-label="Send"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {!showCounter && (
                <button
                  onClick={() => setShowCounter(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Counter offer
                </button>
              )}
              {iAmSeller && (
                <>
                  <button
                    onClick={() => updateStatus('accepted')}
                    disabled={!!updating}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                  >
                    {updating === 'accept' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    Accept
                  </button>
                  <button
                    onClick={() => updateStatus('declined')}
                    disabled={!!updating}
                    className="flex items-center gap-1.5 text-xs font-semibold text-red-700 dark:text-red-300 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-950/20 hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    {updating === 'decline' ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                    Decline
                  </button>
                </>
              )}
              {!iAmSeller && (
                <button
                  onClick={() => updateStatus('withdrawn')}
                  disabled={!!updating}
                  className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50"
                >
                  {updating === 'withdraw' ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                  Withdraw offer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MessageBubble({
  mine,
  name,
  time,
  children,
}: {
  mine: boolean
  name: string
  time: string
  children: React.ReactNode
}) {
  const t = new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return (
    <div className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
        mine
          ? 'bg-primary text-white rounded-br-md'
          : 'bg-white dark:bg-card border border-border rounded-bl-md text-foreground'
      }`}>
        {children}
      </div>
      <p className="text-[10px] text-muted-foreground mt-1 px-1">
        {mine ? 'You' : name} · {t}
      </p>
    </div>
  )
}
