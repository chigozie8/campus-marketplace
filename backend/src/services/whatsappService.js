import axios from 'axios'
import 'dotenv/config'
import logger from '../utils/logger.js'

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
const WHATSAPP_API_URL = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`

/**
 * Send a text message via WhatsApp Cloud API
 * @param {string} to — Recipient's phone number in international format (e.g. 2348012345678)
 * @param {string} text — Message body
 */
export async function sendMessage(to, text) {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    logger.warn('WhatsApp credentials not set. Message not sent.')
    return
  }

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { preview_url: false, body: text },
  }

  try {
    const response = await axios.post(WHATSAPP_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })
    logger.info(`WhatsApp message sent to ${to}: ${response.data?.messages?.[0]?.id}`)
    return response.data
  } catch (err) {
    const details = err.response?.data ?? err.message
    logger.error(`WhatsApp send error to ${to}:`, details)
    throw new Error('Failed to send WhatsApp message.')
  }
}
