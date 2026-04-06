import { Router } from 'express'
import express from 'express'
import * as webhookController from '../controllers/webhookController.js'
import { webhookLimiter } from '../middleware/rateLimiter.js'
import { AuthRequest } from '../types/index.js'
import { Request } from 'express'

const router = Router()

// ─── Paystack ────────────────────────────────────────────────────────────────
router.post(
  '/paystack',
  webhookLimiter,
  express.raw({ type: 'application/json' }),
  (req: Request, _res, next) => {
    ;(req as AuthRequest & { rawBody: Buffer }).rawBody = req.body as Buffer
    try {
      req.body = JSON.parse((req.body as Buffer).toString())
    } catch {
      _res.status(400).json({ success: false, message: 'Invalid JSON payload.' })
      return
    }
    next()
  },
  webhookController.paystackWebhook
)

// ─── WhatsApp ────────────────────────────────────────────────────────────────
router.get('/whatsapp', webhookController.verifyWhatsApp)
router.post('/whatsapp', webhookLimiter, webhookController.whatsAppWebhook)

// ─── Instagram ───────────────────────────────────────────────────────────────
router.get('/instagram', webhookController.verifyInstagram)
router.post('/instagram', webhookLimiter, webhookController.instagramWebhook)

// ─── Facebook Messenger ───────────────────────────────────────────────────────
router.get('/facebook', webhookController.verifyFacebook)
router.post('/facebook', webhookLimiter, webhookController.facebookWebhook)

export default router
