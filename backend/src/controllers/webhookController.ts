import { Request, Response, NextFunction } from 'express'
import { handlePaystackWebhook } from '../services/paymentService.js'
import { addMessageJob } from '../queues/messageQueue.js'
import { verifyYCloudSignature } from '../services/whatsappService.js'
import { AuthRequest } from '../types/index.js'
import logger from '../utils/logger.js'

// ─── WhatsApp (YCloud) ───────────────────────────────────────────────────────

// YCloud does NOT use the hub.verify_token handshake — the GET endpoint is kept
// only for backwards compatibility / health checks.
export function verifyWhatsApp(req: Request, res: Response): void {
  res.status(200).json({ ok: true, provider: 'ycloud' })
}

export async function whatsAppWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // ── Signature verification ──────────────────────────────────────────────
    const signature = req.headers['x-ycloud-signature-256'] as string | undefined
    const rawBody   = (req as AuthRequest & { rawBody?: Buffer }).rawBody

    if (signature && rawBody) {
      if (!verifyYCloudSignature(rawBody, signature)) {
        logger.warn('[WhatsApp] Invalid YCloud signature — request rejected.')
        res.status(403).json({ success: false, message: 'Invalid signature.' })
        return
      }
    }

    // ── Parse YCloud inbound message event ──────────────────────────────────
    const body = req.body

    if (body?.type === 'whatsapp.inbound_message.received') {
      const msg  = body?.whatsapp?.inboundMessage
      const from: string = msg?.from ?? ''
      const text: string = msg?.type === 'text' ? (msg?.text?.body ?? '') : ''

      if (from && text) {
        logger.info(`[WhatsApp] Inbound from ${from}: "${text}"`)
        await addMessageJob({ from, text, platform: 'whatsapp' })
      }
    }

    // Always respond 200 quickly so YCloud doesn't retry
    res.sendStatus(200)
  } catch (err) {
    next(err)
  }
}

// ─── Instagram ──────────────────────────────────────────────────────────────

export function verifyInstagram(req: Request, res: Response): void {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode === 'subscribe' && token === process.env.INSTAGRAM_VERIFY_TOKEN) {
    logger.info('Instagram webhook verified.')
    res.status(200).send(challenge)
    return
  }

  res.status(403).json({ success: false, message: 'Instagram verification failed.' })
}

export async function instagramWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body

    if (body.object === 'instagram') {
      const messagingEvents = body.entry?.[0]?.messaging
      if (messagingEvents && messagingEvents.length > 0) {
        const event = messagingEvents[0]
        const from: string = event.sender?.id ?? ''
        const text: string = event.message?.text ?? ''
        if (from && text) {
          logger.info(`Instagram message from ${from}: "${text}"`)
          await addMessageJob({ from, text, platform: 'instagram' })
        }
      }
    }

    res.sendStatus(200)
  } catch (err) {
    next(err)
  }
}

// ─── Facebook Messenger ─────────────────────────────────────────────────────

export function verifyFacebook(req: Request, res: Response): void {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode === 'subscribe' && token === process.env.FACEBOOK_VERIFY_TOKEN) {
    logger.info('Facebook webhook verified.')
    res.status(200).send(challenge)
    return
  }

  res.status(403).json({ success: false, message: 'Facebook verification failed.' })
}

export async function facebookWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body

    if (body.object === 'page') {
      const messagingEvents = body.entry?.[0]?.messaging
      if (messagingEvents && messagingEvents.length > 0) {
        const event = messagingEvents[0]
        const from: string = event.sender?.id ?? ''
        const text: string = event.message?.text ?? ''
        if (from && text) {
          logger.info(`Facebook message from ${from}: "${text}"`)
          await addMessageJob({ from, text, platform: 'facebook' })
        }
      }
    }

    res.sendStatus(200)
  } catch (err) {
    next(err)
  }
}

// ─── Paystack ────────────────────────────────────────────────────────────────

export async function paystackWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const signature = req.headers['x-paystack-signature'] as string
    const rawBody = (req as AuthRequest & { rawBody?: Buffer }).rawBody

    if (!rawBody) {
      res.status(400).json({ success: false, message: 'Missing raw body.' })
      return
    }

    await handlePaystackWebhook(rawBody, signature, req.body)
    res.sendStatus(200)
  } catch (err) {
    next(err)
  }
}
