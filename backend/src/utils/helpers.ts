import crypto from 'crypto'
import { PaginatedResponse } from '../types/index.js'

export function generateReference(prefix = 'VX'): string {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`
}

export function koboToNaira(kobo: number): string {
  return (kobo / 100).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })
}

export function validatePaystackSignature(rawBody: Buffer, signature: string, secret: string): boolean {
  const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')
  return hash === signature
}

export function paginatedResponse<T>(data: T[], total: number | null, page: number, limit: number): PaginatedResponse<T> {
  const safeTotal = total ?? 0
  return {
    data,
    meta: {
      total: safeTotal,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(safeTotal / limit),
    },
  }
}

export function sanitiseSearchTerm(term = ''): string {
  return term.replace(/[^a-zA-Z0-9 ]/g, '').trim()
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
