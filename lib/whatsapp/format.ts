/**
 * WhatsApp-flavoured message formatting helpers.
 * Centralised so every reply has a consistent voice + currency style.
 */

export const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.vendoorx.ng'

export function naira(amount: number | string): string {
  const n = Number(amount) || 0
  return n.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 })
}

export function shortId(id: string): string {
  return id ? id.slice(0, 8).toUpperCase() : ''
}

export function truncate(s: string | null | undefined, n = 80): string {
  if (!s) return ''
  return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s
}

export function statusLabel(status: string): string {
  return ({
    pending:   '⏳ Awaiting payment',
    paid:      '💚 Paid — preparing',
    shipped:   '🚚 In delivery',
    delivered: '📦 Delivered',
    completed: '✅ Completed',
    cancelled: '❌ Cancelled',
  } as Record<string, string>)[status] ?? status
}
