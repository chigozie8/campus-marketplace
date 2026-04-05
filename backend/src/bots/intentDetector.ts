export interface IntentResult {
  intent: 'greeting' | 'buy' | 'buy_prompt' | 'price' | 'search' | 'order_status' | 'help'
  payload: Record<string, unknown> | null
}

const GREETING_PATTERNS = /^(hi|hello|hey|good morning|good afternoon|good evening|yo|sup|hiya)\b/i
const BUY_PATTERNS = /\bbuy\b/i
const PRICE_PATTERNS = /\b(price|cost|how much|rate)\b/i
const ORDER_STATUS_PATTERNS = /\b(order|status|tracking|where is my)\b/i

const SEARCH_KEYWORDS = [
  'shoes', 'phone', 'food', 'laptop', 'bag', 'cloth', 'watch', 'perfume',
  'electronics', 'fashion', 'book', 'shirt', 'trouser', 'dress', 'sneaker',
  'headphone', 'earphone', 'tablet', 'charger', 'cable', 'case', 'cover',
]

export function detectIntent(text: string): IntentResult {
  const cleaned = text.trim()

  if (GREETING_PATTERNS.test(cleaned)) {
    return { intent: 'greeting', payload: null }
  }

  const buyMatch = cleaned.match(/^buy\s+([a-zA-Z0-9\-]+)$/i)
  if (buyMatch) {
    return { intent: 'buy', payload: { product_id: buyMatch[1].trim() } }
  }

  if (BUY_PATTERNS.test(cleaned)) {
    return { intent: 'buy_prompt', payload: null }
  }

  if (PRICE_PATTERNS.test(cleaned)) {
    return { intent: 'price', payload: { query: cleaned } }
  }

  if (ORDER_STATUS_PATTERNS.test(cleaned)) {
    return { intent: 'order_status', payload: null }
  }

  const matchedKeyword = SEARCH_KEYWORDS.find((kw) => cleaned.toLowerCase().includes(kw))
  if (matchedKeyword) {
    return { intent: 'search', payload: { keyword: matchedKeyword } }
  }

  if (cleaned.split(' ').length >= 2) {
    return { intent: 'search', payload: { keyword: cleaned } }
  }

  return { intent: 'help', payload: null }
}
