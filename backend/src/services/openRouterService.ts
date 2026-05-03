import axios from 'axios'
import logger from '../utils/logger.js'
import { upstashCache } from '../config/redisClient.js'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'openai/gpt-oss-120b:free' // OpenAI GPT-OSS 120B — free tier on OpenRouter

/** Cache TTL in seconds for AI responses (1 hour). */
const CACHE_TTL = 3600

/**
 * Normalise a user message for use as a cache key:
 * lowercase, collapse whitespace, strip punctuation.
 * Only used for cache lookup — NOT sent to the API.
 */
function normaliseForCache(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim()
}

function cacheKey(text: string): string {
  return `bot:ai:${normaliseForCache(text)}`
}

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

  // ── Cache lookup (only for fresh questions with no prior conversation) ──────
  // We skip the cache when there is conversation history because the same
  // question can have a different meaning mid-conversation.
  const shouldCache = upstashCache && conversationHistory.length === 0
  if (shouldCache) {
    try {
      const cached = await upstashCache!.get(cacheKey(userMessage))
      if (cached) {
        logger.info(`[OpenRouter] Cache hit for "${userMessage.slice(0, 40)}…"`)
        return cached
      }
    } catch (cacheErr) {
      logger.warn('[OpenRouter] Cache read error:', cacheErr)
    }
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

    // ── Fix #7: Log token usage so we can monitor free-tier consumption ──────
    const usage = response.data?.usage as { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | undefined
    if (usage) {
      logger.info(
        `[OpenRouter] Token usage — prompt: ${usage.prompt_tokens ?? '?'}, completion: ${usage.completion_tokens ?? '?'}, total: ${usage.total_tokens ?? '?'} | model: ${MODEL}`,
      )
    } else {
      logger.info(`[OpenRouter] AI replied (${reply.length} chars) — no token usage returned`)
    }

    // ── Store in cache if eligible ───────────────────────────────────────────
    if (shouldCache && reply) {
      try {
        await upstashCache!.set(cacheKey(userMessage), reply, CACHE_TTL)
      } catch (cacheErr) {
        logger.warn('[OpenRouter] Cache write error:', cacheErr)
      }
    }

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
