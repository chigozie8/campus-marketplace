import { Router } from 'express'
import express from 'express'
import * as webhookController from '../controllers/webhookController.js'
import { webhookLimiter } from '../middleware/rateLimiter.js'

const router = Router()

// ─── PAYSTACK ────────────────────────────────────────────────────────────────
// Use express.raw() to capture rawBody for HMAC signature verification
router.post(
  '/paystack',
  webhookLimiter,
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    req.rawBody = req.body
    try {
      req.body = JSON.parse(req.body.toString())
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid JSON payload.' })
    }
    next()
  },
  webhookController.paystackWebhook
)

// ─── WHATSAPP ─────────────────────────────────────────────────────────────────
router.get('/whatsapp', webhookController.verifyWhatsApp)
router.post('/whatsapp', webhookLimiter, webhookController.whatsAppWebhook)

export default router
