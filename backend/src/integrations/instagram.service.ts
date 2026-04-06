import axios from 'axios'
import logger from '../utils/logger.js'

const BASE_URL = 'https://graph.facebook.com/v18.0'

export async function sendInstagramMessage(recipientId: string, text: string): Promise<void> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN

  if (!token) {
    logger.warn('Instagram access token not configured — message not sent.')
    return
  }

  try {
    await axios.post(
      `${BASE_URL}/me/messages`,
      {
        recipient: { id: recipientId },
        message: { text },
        messaging_type: 'RESPONSE',
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )
    logger.info(`Instagram message sent to ${recipientId}`)
  } catch (err) {
    logger.error(`Failed to send Instagram message to ${recipientId}:`, err)
    throw err
  }
}
