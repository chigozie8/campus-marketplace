import axios from 'axios'
import logger from '../utils/logger.js'

const BASE_URL = 'https://graph.facebook.com/v18.0'

export async function sendFacebookMessage(recipientId: string, text: string): Promise<void> {
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN

  if (!token) {
    logger.warn('Facebook page access token not configured — message not sent.')
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
        params: { access_token: token },
        headers: { 'Content-Type': 'application/json' },
      }
    )
    logger.info(`Facebook message sent to ${recipientId}`)
  } catch (err) {
    logger.error(`Failed to send Facebook message to ${recipientId}:`, err)
    throw err
  }
}
