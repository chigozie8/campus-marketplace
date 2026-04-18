import { Request, Response, NextFunction } from 'express'
import { handlePaystackWebhook } from '../services/paymentService.js'
import { addMessageJob } from '../queues/messageQueue.js'
import { AuthRequest } from '../types/index.js'
import logger from '../utils/logger.js'

// ─── WhatsApp (WaSenderAPI) ──────────────────────────────────────────────────

import crypto from 'crypto'

// WaSender uses a simple GET ping for health-checks
export function verifyWhatsApp(_req: Request, res: Response): void {
  res.status(200).json({ ok: true, provider: 'wasenderapi' })
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  try { return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b)) }
  catch { return false }
}

function verifyWasenderSignature(rawBody: Buffer | string | undefined, signature: string | undefined): boolean {
  const secret = process.env.WASENDER_WEBHOOK_SECRET
  if (!secret) {
    // Fail-closed in production, permissive in dev for initial setup
    return process.env.NODE_ENV !== 'production'
  }
  if (!rawBody || !signature) return false

  const sig     = signature.replace(/^sha256=/i, '').trim()
  const payload = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : rawBody

  // A) Raw secret token sent as the signature (older WaSender)
  if (safeEqual(sig, secret)) return true
  // B) HMAC-SHA256 hex
  if (safeEqual(sig, crypto.createHmac('sha256', secret).update(payload).digest('hex'))) return true
  // C) HMAC-SHA256 base64
  if (safeEqual(sig, crypto.createHmac('sha256', secret).update(payload).digest('base64'))) return true

  return false
}

function extractFromWasender(body: any): { from: string; text: string } | null {
  if (!body) return null
  const msg = body?.data?.messages?.[0] ?? body?.messages?.[0]
  if (msg) {
    if (msg?.key?.fromMe) return null
    const remoteJid: string = msg?.key?.remoteJid ?? msg?.remoteJid ?? ''
    const phone = remoteJid.split('@')[0] ?? ''
    if (!phone) return null

    const m = msg?.message ?? {}
    const text: string =
      m?.conversation ??
      m?.extendedTextMessage?.text ??
      m?.imageMessage?.caption ??
      m?.videoMessage?.caption ??
      m?.buttonsResponseMessage?.selectedDisplayText ??
      m?.listResponseMessage?.title ??
      ''
    if (!text) return null
    return { from: phone, text }
  }

  const directFrom = body?.from ?? body?.sender ?? body?.phone
  const directText = body?.text ?? body?.message ?? body?.body
  if (directFrom && directText) return { from: String(directFrom), text: String(directText) }
  return null
}

export async function whatsAppWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const signature =
      (req.headers['x-webhook-signature'] as string | undefined) ??
      (req.headers['x-wasender-signature'] as string | undefined) ??
      (req.headers['webhook-signature']   as string | undefined) ??
      (req.headers['signature']           as string | undefined)
    const rawBody = (req as AuthRequest & { rawBody?: Buffer }).rawBody

    if (!verifyWasenderSignature(rawBody, signature)) {
      res.status(401).json({ success: false, message: 'Invalid signature.' })
      return
    }

    const parsed = extractFromWasender(req.body)
    if (parsed) {
      logger.info(`[WhatsApp] Inbound from ${parsed.from}: "${parsed.text}"`)
      await addMessageJob({ from: parsed.from, text: parsed.text, platform: 'whatsapp' })
    }

    // Always respond 200 quickly — provider retries if it doesn't get 200
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
