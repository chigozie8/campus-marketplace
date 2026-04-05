import { Request, Response, NextFunction } from 'express'
import { handlePaystackWebhook } from '../services/paymentService.js'
import { addMessageJob } from '../queues/messageQueue.js'
import { AuthRequest } from '../types/index.js'
import logger from '../utils/logger.js'

export function verifyWhatsApp(req: Request, res: Response): void {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    logger.info('WhatsApp webhook verified.')
    res.status(200).send(challenge)
    return
  }

  res.status(403).json({ success: false, message: 'Verification failed.' })
}

export async function whatsAppWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body

    if (body.object === 'whatsapp_business_account') {
      const messages = body.entry?.[0]?.changes?.[0]?.value?.messages
      if (messages && messages.length > 0) {
        const message = messages[0]
        const from: string = message.from
        const text: string = message.text?.body ?? ''
        logger.info(`WhatsApp message from ${from}: "${text}"`)
        await addMessageJob({ from, text })
      }
    }

    res.sendStatus(200)
  } catch (err) {
    next(err)
  }
}

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
