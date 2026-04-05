/**
 * Detects the intent of an incoming message.
 * Returns one of: 'greeting' | 'buy' | 'price' | 'search' | 'order_status' | 'help' | 'unknown'
 */

const GREETING_PATTERNS = /^(hi|hello|hey|good morning|good afternoon|good evening|yo|sup|hiya)\b/i
const BUY_PATTERNS = /\bbuy\b/i
const PRICE_PATTERNS = /\b(price|cost|how much|rate)\b/i
const ORDER_STATUS_PATTERNS = /\b(order|status|tracking|where is my)\b/i
const SEARCH_KEYWORDS = [
  'shoes', 'phone', 'food', 'laptop', 'bag', 'cloth', 'watch', 'perfume',
  'electronics', 'fashion', 'book', 'shirt', 'trouser', 'dress', 'sneaker',
  'headphone', 'earphone', 'tablet', 'charger', 'cable', 'case', 'cover',
]

/**
 * @param {string} text — Raw message text from user
 * @returns {{ intent: string, payload: any }}
 */
export function detectIntent(text) {
  const cleaned = text.trim()

  if (GREETING_PATTERNS.test(cleaned)) {
    return { intent: 'greeting', payload: null }
  }

  // "BUY <product_id>" — exact buy command
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

  // Check against known search keywords
  const matchedKeyword = SEARCH_KEYWORDS.find((kw) => cleaned.toLowerCase().includes(kw))
  if (matchedKeyword) {
    return { intent: 'search', payload: { keyword: matchedKeyword } }
  }

  // Treat any unknown multi-word text as a freeform search
  if (cleaned.split(' ').length >= 2) {
    return { intent: 'search', payload: { keyword: cleaned } }
  }

  return { intent: 'help', payload: null }
}
