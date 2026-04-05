import axios from 'axios'
import logger from '../utils/logger.js'

const BASE_URL = 'https://graph.facebook.com/v18.0'

export async function sendMessage(to: string, text: string): Promise<void> {
  const token = process.env.WHATSAPP_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!token || !phoneNumberId) {
    logger.warn('WhatsApp credentials not configured — message not sent.')
    return
  }

  try {
    await axios.post(
      `${BASE_URL}/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )
    logger.info(`WhatsApp message sent to ${to}`)
  } catch (err) {
    logger.error(`Failed to send WhatsApp message to ${to}:`, err)
    throw err
  }
}
