import * as paymentService from '../services/paymentService.js'
import { handleIncomingMessage } from '../bots/messageHandler.js'
import logger from '../utils/logger.js'

// ─── PAYSTACK WEBHOOK ─────────────────────────────────────────────────────────

export async function paystackWebhook(req, res, next) {
  try {
    const signature = req.headers['x-paystack-signature']
    // req.rawBody is set by the express.raw() middleware on this route
    await paymentService.handlePaystackWebhook(req.rawBody, signature, req.body)
    return res.status(200).json({ success: true })
  } catch (err) {
    next(err)
  }
}

// ─── WHATSAPP WEBHOOK ─────────────────────────────────────────────────────────

/**
 * Webhook verification (GET) — WhatsApp sends a challenge that we must echo back
 */
export function verifyWhatsApp(req, res) {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    logger.info('WhatsApp webhook verified.')
    return res.status(200).send(challenge)
  }

  return res.status(403).json({ success: false, message: 'Verification failed.' })
}

/**
 * Incoming WhatsApp messages (POST)
 */
export async function whatsAppWebhook(req, res, next) {
  try {
    const body = req.body

    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0]
      const changes = entry?.changes?.[0]
      const messages = changes?.value?.messages

      if (messages && messages.length > 0) {
        const message = messages[0]
        const from = message.from // Sender's WhatsApp number
        const text = message.text?.body ?? ''

        logger.info(`WhatsApp message from ${from}: "${text}"`)

        // Process asynchronously — respond to WhatsApp immediately with 200
        handleIncomingMessage(from, text).catch((err) =>
          logger.error('Bot message handler error:', err)
        )
      }
    }

    // Always respond 200 quickly to WhatsApp to avoid retries
    return res.sendStatus(200)
  } catch (err) {
    next(err)
  }
}
