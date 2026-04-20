'use client'

import { useState } from 'react'
import { ShieldCheck, Loader2, RefreshCw } from 'lucide-react'
import { ordersApi } from '@/lib/api'
import { Button } from '@/components/ui/button'

type Props = {
  orderId: string
  onConfirmed?: () => void
}

/**
 * Buyer-facing delivery confirmation card.
 *
 * The OTP is sent automatically to the buyer (SMS + email + in-app bell) when
 * the seller marks the order as shipped. The buyer pastes the 6-digit code
 * here to confirm receipt — that releases escrow to the seller.
 */
export function DeliveryOtpCard({ orderId, onConfirmed }: Props) {
  const [otp, setOtp] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState<{ kind: 'error' | 'info'; text: string } | null>(null)

  async function verify() {
    if (otp.trim().length < 4) {
      setMessage({ kind: 'error', text: 'Enter the 6-digit code from your email, SMS, or notifications.' })
      return
    }
    setVerifying(true)
    setMessage(null)
    try {
      const res = await ordersApi.verifyDeliveryOtp(orderId, otp.trim())
      if (!res.success) {
        setMessage({ kind: 'error', text: res.message || 'Code did not match. Please try again.' })
        return
      }
      setMessage({ kind: 'info', text: res.message || 'Delivery confirmed!' })
      onConfirmed?.()
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'Failed to verify code.' })
    } finally {
      setVerifying(false)
    }
  }

  async function resend() {
    setResending(true)
    setMessage(null)
    try {
      const res = await ordersApi.resendDeliveryOtp(orderId)
      setMessage({
        kind: res.success ? 'info' : 'error',
        text: res.message || (res.success ? 'A new code has been sent.' : 'Failed to resend code.'),
      })
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'Failed to resend code.' })
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-950/20 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-emerald-600 text-white p-2 shrink-0">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Confirm your delivery</h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5">
            Enter the 6-digit code we sent to your email, phone, and in-app bell. Only confirm <strong>after</strong> your
            item arrives — this releases payment to the seller.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={8}
          value={otp}
          onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="123456"
          className="flex-1 rounded-md border-2 border-emerald-400 dark:border-emerald-700 bg-white dark:bg-zinc-950 px-4 py-2 text-center text-lg font-mono tracking-[0.4em] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
        />
        <Button
          type="button"
          onClick={verify}
          disabled={verifying || otp.trim().length < 4}
          className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
        >
          {verifying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Confirm delivery
        </Button>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={resend}
          disabled={resending}
          className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline disabled:opacity-50 inline-flex items-center gap-1"
        >
          {resending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          Resend code
        </button>
        {message && (
          <p className={`text-xs ${message.kind === 'error' ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  )
}
