import { detectIntent } from './intentDetector.js'
import * as rb from './responseBuilder.js'
import * as productService from '../services/productService.js'
import * as orderService from '../services/orderService.js'
import { sendMessage } from '../services/whatsappService.js'
import { redis } from '../config/redisClient.js'
import logger from '../utils/logger.js'
import { BotSession } from '../types/index.js'

const inMemorySessions = new Map<string, BotSession>()
const SESSION_TTL = 1800 // 30 minutes

async function getSession(phone: string): Promise<BotSession> {
  if (redis) {
    try {
      const raw = await redis.get(`bot:session:${phone}`)
      if (raw) return JSON.parse(raw) as BotSession
    } catch { /* fallback to in-memory */ }
  }
  return inMemorySessions.get(phone) ?? { phone, updatedAt: Date.now() }
}

async function saveSession(session: BotSession): Promise<void> {
  session.updatedAt = Date.now()
  if (redis) {
    try {
      await redis.setex(`bot:session:${session.phone}`, SESSION_TTL, JSON.stringify(session))
      return
    } catch { /* fallback */ }
  }
  inMemorySessions.set(session.phone, session)
}

export async function handleIncomingMessage(phone: string, text: string): Promise<void> {
  logger.info(`Bot: incoming message from ${phone}: "${text}"`)

  const { intent, payload } = detectIntent(text)
  const session = await getSession(phone)
  let replyText: string

  try {
    switch (intent) {
      case 'greeting':
        replyText = rb.buildGreeting()
        session.lastIntent = 'greeting'
        break

      case 'search':
      case 'price': {
        const keyword = (payload?.keyword as string) ?? text
        const products = await productService.searchProductsForBot(keyword, 5)
        replyText = rb.buildProductList(products)
        if (products.length > 0) session.lastProductId = products[0].id
        session.lastIntent = 'search'
        break
      }

      case 'buy': {
        const productId = payload?.product_id as string
        try {
          const product = await productService.getProduct(productId)
          replyText = rb.buildSingleProduct(product)
          session.lastProductId = productId
          session.lastIntent = 'buy'
        } catch {
          replyText = `Sorry, I couldn't find that product. Please check the ID and try again.`
        }
        break
      }

      case 'buy_prompt':
        replyText = rb.buildBuyPrompt()
        break

      case 'order_status':
        replyText = rb.buildOrderStatusHelp()
        break

      default:
        replyText = rb.buildHelp()
    }
  } catch (err) {
    logger.error(`Bot handler error for ${phone}:`, err)
    replyText = rb.buildError()
  }

  await saveSession(session)
  await sendMessage(phone, replyText)
}
