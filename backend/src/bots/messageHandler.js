import { detectIntent } from './intentDetector.js'
import * as rb from './responseBuilder.js'
import * as db from '../services/supabaseService.js'
import { sendMessage } from '../services/whatsappService.js'
import logger from '../utils/logger.js'

// Basic in-memory session store (phone → session object)
// For production scale, replace with Redis (Upstash) TTL keys
const sessions = new Map()

function getSession(phone) {
  if (!sessions.has(phone)) {
    sessions.set(phone, { lastIntent: null, pendingProductId: null })
  }
  return sessions.get(phone)
}

/**
 * Main entry point — called for every incoming WhatsApp message
 */
export async function handleIncomingMessage(from, text) {
  const session = getSession(from)

  try {
    const { intent, payload } = detectIntent(text)
    session.lastIntent = intent

    let reply

    switch (intent) {
      case 'greeting': {
        reply = rb.buildWelcome()
        break
      }

      case 'search':
      case 'price': {
        const keyword = payload?.keyword ?? text
        const products = await db.searchProductsByKeyword(keyword, 5)
        reply = rb.buildProductList(products)
        break
      }

      case 'buy': {
        const productId = payload.product_id
        try {
          const product = await db.getProductById(productId)
          session.pendingProductId = productId
          // Without auth context in WhatsApp, we guide the user to the app
          reply = rb.buildSingleProduct(product) + '\n\nTo complete your purchase, please visit the VendorX app and place your order there.'
        } catch {
          reply = `Sorry, I could not find a product with ID: *${productId}*. Please check and try again.`
        }
        break
      }

      case 'buy_prompt': {
        reply = rb.buildBuyPrompt()
        break
      }

      case 'order_status': {
        reply = rb.buildOrderStatusHelp()
        break
      }

      case 'help':
      default: {
        reply = rb.buildHelp()
      }
    }

    await sendMessage(from, reply)
  } catch (err) {
    logger.error(`handleIncomingMessage error for ${from}:`, err)
    await sendMessage(from, rb.buildError()).catch(() => {})
  }
}
