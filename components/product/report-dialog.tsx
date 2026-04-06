'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flag, Loader2, X, CheckCircle2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const REASONS = [
  { value: 'scam', label: 'Scam or fraud' },
  { value: 'fake_item', label: 'Fake or counterfeit item' },
  { value: 'wrong_price', label: 'Misleading price or description' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'wrong_category', label: 'Wrong category' },
  { value: 'other', label: 'Other' },
]

interface Props {
  productId: string
  productTitle: string
  currentUserId: string | null
}

export function ReportDialog({ productId, productTitle, currentUserId }: Props) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  function handleOpen() {
    if (!currentUserId) { toast.error('Sign in to report a listing'); return }
    setOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason) { toast.error('Please select a reason'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, reason, details: details.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit report')
      setDone(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setOpen(false)
    setTimeout(() => { setDone(false); setReason(''); setDetails('') }, 300)
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors"
      >
        <Flag className="w-3 h-3" />
        Report listing
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleClose}
            />
            <motion.div
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
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">Report Submitted</h3>
                    <p className="text-sm text-gray-500 dark:text-muted-foreground mt-1">
                      Our team will review this listing within 24 hours. Thank you for keeping VendoorX safe.
                    </p>
                  </div>
                  <Button onClick={handleClose} className="w-full rounded-xl">Done</Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900 dark:text-white">Report Listing</h3>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground line-clamp-1">{productTitle}</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Reason</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {REASONS.map(r => (
                          <button
                            key={r.value}
                            type="button"
                            onClick={() => setReason(r.value)}
                            className={`text-left px-3 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all ${
                              reason === r.value
                                ? 'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-600'
                                : 'border-gray-200 dark:border-border text-gray-600 dark:text-muted-foreground hover:border-gray-300'
                            }`}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold">Additional details (optional)</Label>
                      <textarea
                        value={details}
                        onChange={e => setDetails(e.target.value)}
                        placeholder="Tell us more about the issue..."
                        rows={3}
                        className="w-full px-3.5 py-2.5 rounded-xl border-2 border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading || !reason}
                      className="w-full h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold gap-2"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
                      {loading ? 'Submitting...' : 'Submit Report'}
                    </Button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
