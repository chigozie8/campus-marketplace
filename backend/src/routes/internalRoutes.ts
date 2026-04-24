import { Router, Request, Response, NextFunction } from 'express'
import * as walletService from '../services/walletService.js'
import logger from '../utils/logger.js'

const router = Router()

/**
 * Service-to-service auth: callers must present x-internal-key matching
 * INTERNAL_API_KEY. Used by the Next.js app (which lives in the same Replit
 * container in dev / single-deploy production) to invoke backend operations
 * that don't fit the user-auth model (e.g. crediting a seller's wallet from
 * the Paystack verify path).
 */
function requireInternalKey(req: Request, res: Response, next: NextFunction): void {
  const expected = process.env.INTERNAL_API_KEY
  if (!expected) {
    res.status(500).json({ success: false, message: 'INTERNAL_API_KEY not configured on backend.' })
    return
  }
  if (req.header('x-internal-key') !== expected) {
    res.status(401).json({ success: false, message: 'Invalid internal key.' })
    return
  }
  next()
}

router.use(requireInternalKey)

/**
 * POST /api/internal/credit-seller-pending
 * Body: { sellerId, orderId, totalPaid }
 *
 * Idempotent — walletService skips if a pending entry already exists for this
 * order. Called by the Next.js verify/webhook flow after an order is flipped
 * to 'paid'. The platform fee is read live from site_settings inside the
 * service so the seller is credited (totalPaid - platform_fee).
 */
router.post('/credit-seller-pending', async (req, res) => {
  const { sellerId, orderId, totalPaid } = req.body ?? {}
  if (!sellerId || !orderId || typeof totalPaid !== 'number') {
    res.status(400).json({ success: false, message: 'sellerId, orderId, totalPaid (number) are required.' })
    return
  }

  try {
    await walletService.creditSellerPending(String(sellerId), String(orderId), Number(totalPaid))
    res.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'wallet credit failed'
    logger.error(`[internal/credit-seller-pending] ${msg}`)
    res.status(500).json({ success: false, message: msg })
  }
})

export default router
