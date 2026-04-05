import crypto from 'crypto'

/**
 * Generate a Paystack-compatible reference string
 */
export function generateReference(prefix = 'VX') {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`
}

/**
 * Format amount from kobo to Naira for display
 */
export function koboToNaira(kobo) {
  return (kobo / 100).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })
}

/**
 * Validate Paystack webhook signature
 */
export function validatePaystackSignature(rawBody, signature, secret) {
  const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')
  return hash === signature
}

/**
 * Build a paginated response object
 */
export function paginatedResponse(data, total, page, limit) {
  return {
    data,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  }
}

/**
 * Sanitise string for search queries
 */
export function sanitiseSearchTerm(term = '') {
  return term.replace(/[^a-zA-Z0-9 ]/g, '').trim()
}
