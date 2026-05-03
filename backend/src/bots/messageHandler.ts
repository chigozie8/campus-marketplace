import { detectIntent } from './intentDetector.js'
import * as rb from './responseBuilder.js'
import * as productService from '../services/productService.js'
import { sendMessage } from '../services/whatsappService.js'
import { redis } from '../config/redisClient.js'
import logger from '../utils/logger.js'
import { BotSession } from '../types/index.js'
import { askOpenRouter, ChatMessage } from '../services/openRouterService.js'
import { isRateLimited, isDuplicate } from './botGuards.js'
import {
  upsertConversation,
  addMessage,
  incrementUnread,
} from '../services/conversationService.js'

const inMemorySessions = new Map<string, BotSession>()
const SESSION_TTL = 1800 // 30 minutes

async function getSession(phone: string): Promise<BotSession> {
  if (redis) {
    try {
      const raw = await redis.get(`bot:session:${phone}`)
      if (raw) return JSON.parse(raw) as BotSession
    } catch { /* fallback */ }
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

// Handle numbered menu shortcuts (1–6)
function resolveMenuShortcut(text: string): string | null {
  const t = text.trim()
  const map: Record<string, string> = {
    '1': 'search',
    '2': 'order',
    '3': 'refund',
    '4': 'contact seller',
    '5': 'how does vendoorx work',
    '6': 'agent',
  }
  return map[t] ?? null
}

export async function handleIncomingMessage(phone: string, rawText: string): Promise<void> {
  logger.info(`[Bot] Incoming from ${phone}: "${rawText}"`)

  // Guard 1: Deduplication — drop webhook retries silently
  if (await isDuplicate(phone, rawText)) return

  // Guard 2: Rate limiting — warn the user and drop the message
  if (await isRateLimited(phone)) {
    await sendMessage(phone, 'You are sending messages too fast. Please wait a moment before trying again.')
    return
  }

  const text = resolveMenuShortcut(rawText) ?? rawText
  const { intent, payload } = detectIntent(text)
  const session = await getSession(phone)
  let reply: string

  try {
    switch (intent) {
      case 'greeting':
        reply = rb.buildGreeting()
        session.lastIntent = 'greeting'
        break

      case 'search':
      case 'price': {
        const keyword = (payload?.keyword as string) ?? text
        const products = await productService.searchProductsForBot(keyword, 5)
        reply = rb.buildProductList(products)
        if (products.length > 0) session.lastProductId = products[0].id
        session.lastIntent = 'search'
        break
      }

      case 'buy': {
        const productId = payload?.product_id as string
        try {
          const product = await productService.getProduct(productId)
          reply = rb.buildSingleProduct(product)
          session.lastProductId = productId
          session.lastIntent = 'buy'
        } catch {
          reply = `❌ Couldn't find that product. Please check the ID and try again, or search for a product first.`
        }
        break
      }

      case 'buy_prompt':
        reply = rb.buildBuyPrompt()
        break

      case 'order_status':
        reply = rb.buildOrderStatus()
        session.lastIntent = 'order_status'
        break

      case 'track_order':
        reply = rb.buildTrackOrder()
        session.lastIntent = 'track_order'
        break

      case 'return_refund':
        reply = rb.buildReturnRefund()
        session.lastIntent = 'return_refund'
        break

      case 'contact_seller':
        reply = rb.buildContactSeller()
        session.lastIntent = 'contact_seller'
        break

      case 'how_it_works':
        reply = rb.buildHowItWorks()
        session.lastIntent = 'how_it_works'
        break

      case 'human':
        reply = rb.buildHumanHandoff()
        session.lastIntent = 'human'
        break

      default: {
        // Build conversation history for the AI (user/assistant pairs only)
        const history: ChatMessage[] = (session.aiHistory ?? []).map((m) => ({
          role: m.role,
          content: m.content,
        }))

        const aiReply = await askOpenRouter(text, history)

        if (aiReply) {
          reply = aiReply
          // Store the exchange in session history (keep last 6 messages = 3 turns)
          const updatedHistory = [
            ...(session.aiHistory ?? []),
            { role: 'user' as const, content: text },
            { role: 'assistant' as const, content: aiReply },
          ].slice(-6)
          session.aiHistory = updatedHistory
        } else {
          reply = rb.buildHelp()
        }
        session.lastIntent = 'ai'
        break
      }
    }
  } catch (err) {
    logger.error(`[Bot] Handler error for ${phone}:`, err)
    reply = rb.buildError()
  }

  await saveSession(session)
  await sendMessage(phone, reply)

  // Persist conversation to Supabase (non-blocking — errors are swallowed so
  // a DB hiccup never takes down the bot response).
  try {
    const conversationId = await upsertConversation({
      platform: 'whatsapp',
      externalId: phone,
      customerPhone: phone,
    })
    if (conversationId) {
      await addMessage({ conversationId, direction: 'incoming', content: rawText, platform: 'whatsapp' })
      await incrementUnread(conversationId)
      await addMessage({ conversationId, direction: 'outgoing', content: reply, platform: 'whatsapp' })
    }
  } catch (persistErr) {
    logger.warn('[Bot] Failed to persist conversation to Supabase:', persistErr)
  }
}
