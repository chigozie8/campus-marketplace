import axios from 'axios'
import logger from '../utils/logger.js'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'openai/gpt-3.5-turbo' // free-tier model on OpenRouter

const SYSTEM_PROMPT = `You are the VendoorX WhatsApp assistant — a helpful, friendly, and concise AI bot for Nigeria's #1 campus marketplace.

About VendoorX:
- Students can buy and sell products on campus securely
- All payments are protected by an escrow system (money is held until buyer confirms delivery)
- Sellers list products for free and get paid to their wallet
- Buyers can search, order, track, and dispute purchases

Your job:
- Answer questions about the platform, products, orders, payments, and policies
- Be concise — WhatsApp messages should be short and easy to read
- Use simple, friendly Nigerian-English where appropriate
- If the user wants to search for a product, tell them to type the product name
- If the user has an urgent issue you can't resolve, tell them to type "agent" to speak with a human
- Never make up product prices, order IDs, or specific user data you don't have access to
- Keep responses under 200 words
- Use WhatsApp-style formatting: *bold* for emphasis, line breaks for clarity`

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function askOpenRouter(
  userMessage: string,
  conversationHistory: ChatMessage[] = [],
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    logger.warn('[OpenRouter] OPENROUTER_API_KEY is not set — skipping AI fallback')
    return ''
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...conversationHistory.slice(-6), // keep last 3 exchanges (6 messages) for context
    { role: 'user', content: userMessage },
  ]

  try {
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: MODEL,
        messages,
        max_tokens: 300,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.FRONTEND_URL ?? 'https://vendoorx.ng',
          'X-Title': 'VendoorX WhatsApp Bot',
        },
        timeout: 15000,
      },
    )

    const reply: string = response.data?.choices?.[0]?.message?.content?.trim() ?? ''
    logger.info(`[OpenRouter] AI replied (${reply.length} chars)`)
    return reply
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      logger.error(`[OpenRouter] API error: ${err.response?.status} — ${JSON.stringify(err.response?.data)}`)
    } else {
      logger.error('[OpenRouter] Unexpected error:', err)
    }
    return ''
  }
}
