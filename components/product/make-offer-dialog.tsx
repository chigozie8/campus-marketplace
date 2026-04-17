'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { m, LazyMotion, domAnimation, AnimatePresence } from 'framer-motion'
import { Tag, Loader2, X, Send, CheckCircle2, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  productId: string
  productTitle: string
  listingPrice: number
  sellerId: string
  currentUserId: string | null
}

export function MakeOfferDialog({ productId, productTitle, listingPrice, sellerId, currentUserId }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [offerPrice, setOfferPrice] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [createdOfferId, setCreatedOfferId] = useState<string | null>(null)

  function handleOpen() {
    if (!currentUserId) { toast.error('Sign in to make an offer'); return }
    if (currentUserId === sellerId) { toast.error("You can't make an offer on your own listing"); return }
    setOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const price = Number(offerPrice)
    if (!price || price <= 0) { toast.error('Enter a valid offer price'); return }
    if (price >= listingPrice) { toast.error('Your offer should be less than the listing price'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, offerPrice: price, message: message.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send offer')
      setCreatedOfferId(data.offer?.id ?? null)
      setDone(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setOpen(false)
    setTimeout(() => { setDone(false); setOfferPrice(''); setMessage(''); setCreatedOfferId(null) }, 300)
  }

  const discount = offerPrice && Number(offerPrice) > 0
    ? Math.round(((listingPrice - Number(offerPrice)) / listingPrice) * 100)
    : 0

  return (
    <>
      <Button
        variant="outline"
        onClick={handleOpen}
        className="w-full h-10 rounded-xl border-2 border-primary/30 text-primary font-bold text-sm hover:bg-primary/5 hover:border-primary transition-all gap-2"
      >
        <Tag className="w-4 h-4" />
        Make an Offer
      </Button>

      <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleClose}
            />
            <m.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-md bg-white dark:bg-card rounded-3xl shadow-2xl p-6"
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-muted flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {done ? (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">Offer Sent!</h3>
                    <p className="text-sm text-gray-500 dark:text-muted-foreground mt-1">
                      The seller will be notified and can accept or counter your offer.
                    </p>
                  </div>
                  <div className="w-full grid grid-cols-2 gap-2">
                    {createdOfferId && (
                      <Button
                        onClick={() => { router.push(`/offers/${createdOfferId}`); handleClose() }}
                        className="rounded-xl gap-1.5"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Open Chat
                      </Button>
                    )}
                    <Button
                      onClick={handleClose}
                      variant={createdOfferId ? 'outline' : 'default'}
                      className={`rounded-xl ${createdOfferId ? '' : 'col-span-2'}`}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-5">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">Make an Offer</h3>
                    <p className="text-sm text-gray-500 dark:text-muted-foreground mt-0.5 line-clamp-1">{productTitle}</p>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-muted mb-4">
                    <span className="text-xs text-gray-500">Listing price</span>
                    <span className="font-black text-gray-900 dark:text-white">₦{listingPrice.toLocaleString()}</span>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold">Your Offer Price (₦)</Label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₦</span>
                        <Input
                          type="number"
                          min={1}
                          max={listingPrice - 1}
                          value={offerPrice}
                          onChange={e => setOfferPrice(e.target.value)}
                          className="pl-8 h-11 rounded-xl border-2 text-sm font-bold"
                          placeholder={Math.round(listingPrice * 0.85).toLocaleString()}
                          required
                        />
                      </div>
                      {discount > 0 && (
                        <p className="text-xs text-green-600 font-semibold">
                          {discount}% below listing price
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold">Message (optional)</Label>
                      <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Hi, is this price negotiable? I can pick it up today..."
                        rows={3}
                        className="w-full px-3.5 py-2.5 rounded-xl border-2 border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 rounded-xl bg-gray-950 hover:bg-gray-800 text-white font-bold gap-2"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {loading ? 'Sending...' : 'Send Offer'}
                    </Button>
                  </form>
                </>
              )}
            </m.div>
          </div>
        )}
      </AnimatePresence>
      </LazyMotion>
    </>
  )
}
