import { Request, Response, NextFunction } from 'express'
import { handlePaystackWebhook } from '../services/paymentService.js'
import { addMessageJob } from '../queues/messageQueue.js'
import { AuthRequest } from '../types/index.js'
import logger from '../utils/logger.js'

// NOTE: AuthRequest is still used for the Paystack rawBody extraction below

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

function verifyWasenderSignature(req: Request): boolean {
  const secret = process.env.WASENDER_WEBHOOK_SECRET

  // Always log the incoming signature header so Railway logs show it
  const incoming = req.headers['x-webhook-signature'] as string | undefined
  logger.info(`[WhatsApp] Webhook received — X-Webhook-Signature: "${incoming ?? 'none'}"`)

  // If no secret is configured, accept everything
  if (!secret) {
    logger.warn('[WhatsApp] WASENDER_WEBHOOK_SECRET not set — accepting all webhooks')
    return true
  }

  // Per WaSender docs: X-Webhook-Signature is sent as a plain secret token
  // Docs example: if (!signature || !webhookSecret || signature !== webhookSecret) return false
  if (!incoming) {
    logger.warn('[WhatsApp] No X-Webhook-Signature header — accepting (configure secret in WaSender dashboard)')
    return true
  }

  if (safeEqual(incoming.trim(), secret.trim())) return true

  logger.warn(`[WhatsApp] Signature mismatch — rejecting webhook`)
  return false
}

function extractFromWasender(body: any): { from: string; text: string } | null {
  if (!body) return null

  logger.info('[WhatsApp] Raw webhook body: ' + JSON.stringify(body))

  // WaSender sends data.messages as a single object (not an array)
  // Ref: https://wasenderapi.com/api-docs/webhooks/webhook-message-received
  const rawMsg = body?.data?.messages ?? body?.data?.message
  // Support both object and array formats defensively
  const msg = Array.isArray(rawMsg) ? rawMsg[0] : rawMsg

  if (msg) {
    // Ignore messages sent by the bot itself
    if (msg?.key?.fromMe === true) {
      logger.info('[WhatsApp] Ignoring outgoing message (fromMe=true)')
      return null
    }

    // WaSender recommends cleanedSenderPn for private chats
    const phone: string =
      msg?.key?.cleanedSenderPn ??
      msg?.key?.senderPn?.replace('@s.whatsapp.net', '') ??
      msg?.key?.remoteJid?.split('@')[0] ??
      ''

    if (!phone) {
      logger.warn('[WhatsApp] Could not extract phone from message key: ' + JSON.stringify(msg?.key))
      return null
    }

    // WaSender sends text in messageBody (top-level) and also in message.conversation
    const text: string =
      msg?.messageBody ??
      msg?.message?.conversation ??
      msg?.message?.extendedTextMessage?.text ??
      msg?.message?.imageMessage?.caption ??
      msg?.message?.videoMessage?.caption ??
      msg?.message?.buttonsResponseMessage?.selectedDisplayText ??
      msg?.message?.listResponseMessage?.title ??
      ''

    if (!text.trim()) {
      logger.info('[WhatsApp] Skipping message with no text content')
      return null
    }

    return { from: phone, text: text.trim() }
  }

  // Fallback: some integrations send a flat structure
  const directFrom = body?.from ?? body?.sender ?? body?.phone
  const directText = body?.text ?? body?.message ?? body?.body ?? body?.messageBody
  if (directFrom && directText) {
    return { from: String(directFrom), text: String(directText).trim() }
  }

  logger.warn('[WhatsApp] Could not extract message from payload — unknown format')
  return null
}

// Incoming message events we care about — all others are status/session updates
const INCOMING_MESSAGE_EVENTS = new Set([
  'messages.received',
  'messages-personal.received',
  'messages.upsert',
])

export async function whatsAppWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!verifyWasenderSignature(req)) {
      logger.warn(`[WhatsApp] Rejected webhook from ${req.ip} — invalid signature`)
      res.status(401).json({ success: false, message: 'Invalid signature.' })
      return
    }

    const event: string = req.body?.event ?? ''
    logger.info(`[WhatsApp] Webhook event: "${event}"`)

    // Only process actual incoming message events — ignore status, session, group, etc.
    if (!INCOMING_MESSAGE_EVENTS.has(event)) {
      res.sendStatus(200)
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

// ─── Admin bot simulation ────────────────────────────────────────────────────

export async function simulateBotMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Reuse WASENDER_WEBHOOK_SECRET as the internal key — already required in .env
    const expectedKey = process.env.WASENDER_WEBHOOK_SECRET ?? process.env.INTERNAL_API_KEY
    const providedKey = req.headers['x-internal-key']
    if (!expectedKey || !providedKey || !safeEqual(String(providedKey), expectedKey)) {
      res.status(401).json({ success: false, message: 'Unauthorized' })
      return
    }

    const { phone, message } = req.body as { phone?: string; message?: string }
    if (!phone || !message) {
      res.status(400).json({ success: false, message: 'phone and message are required' })
      return
    }

    logger.info(`[Bot Simulate] Admin triggered test message to ${phone}: "${message}"`)
    await addMessageJob({ from: phone, text: message, platform: 'whatsapp' })
    res.status(200).json({ ok: true })
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
