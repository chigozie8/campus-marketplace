export interface IntentResult {
  intent:
    | 'greeting'
    | 'search'
    | 'buy'
    | 'buy_prompt'
    | 'price'
    | 'order_status'
    | 'track_order'
    | 'return_refund'
    | 'contact_seller'
    | 'how_it_works'
    | 'human'
    | 'help'
  payload: Record<string, unknown> | null
}

const GREETING       = /^(hi|hello|hey|good morning|good afternoon|good evening|yo|sup|hiya|hy|howdy|start)\b/i
const BUY_ID         = /^buy\s+([a-zA-Z0-9\-]+)$/i
const BUY_WORD       = /\bbuy\b/i
const PRICE_WORD     = /\b(price|cost|how much|rate|fee|charge)\b/i
const ORDER_STATUS   = /\b(order|status|my order|my purchase|ordered)\b/i
const TRACK          = /\b(track|tracking|where is|delivery|dispatch|shipped|arrive|when will)\b/i
const RETURN_REFUND  = /\b(return|refund|cancel|dispute|wrong item|damaged|complaint)\b/i
const CONTACT_SELLER = /\b(seller|vendor|shop|contact|reach|talk to seller|whatsapp seller)\b/i
const HOW_IT_WORKS   = /\b(how does|how do|how to|how it works|what is vendoor|explain|guide)\b/i
const HUMAN          = /\b(human|agent|person|support|help me|talk to someone|real person|customer care)\b/i

const SEARCH_KEYWORDS = [
  'shoes', 'phone', 'food', 'laptop', 'bag', 'cloth', 'watch', 'perfume',
  'electronics', 'fashion', 'book', 'shirt', 'trouser', 'dress', 'sneaker',
  'headphone', 'earphone', 'tablet', 'charger', 'cable', 'case', 'cover',
  'hair', 'beauty', 'skincare', 'makeup', 'jewellery', 'jewelry', 'hoodie',
  'jean', 'sandal', 'slipper', 'wristwatch', 'sunglasses', 'wallet', 'belt',
]

export function detectIntent(text: string): IntentResult {
  const t = text.trim()

  if (GREETING.test(t))        return { intent: 'greeting',        payload: null }
  if (HUMAN.test(t))           return { intent: 'human',           payload: null }
  if (RETURN_REFUND.test(t))   return { intent: 'return_refund',   payload: null }
  if (CONTACT_SELLER.test(t))  return { intent: 'contact_seller',  payload: null }
  if (HOW_IT_WORKS.test(t))    return { intent: 'how_it_works',    payload: null }
  if (TRACK.test(t))           return { intent: 'track_order',     payload: null }
  if (ORDER_STATUS.test(t))    return { intent: 'order_status',    payload: null }

  const buyIdMatch = t.match(BUY_ID)
  if (buyIdMatch) return { intent: 'buy', payload: { product_id: buyIdMatch[1].trim() } }

  if (BUY_WORD.test(t))  return { intent: 'buy_prompt', payload: null }
  if (PRICE_WORD.test(t)) return { intent: 'price',     payload: { query: t } }

  const matched = SEARCH_KEYWORDS.find((kw) => t.toLowerCase().includes(kw))
  if (matched) return { intent: 'search', payload: { keyword: matched } }

  if (t.split(' ').length >= 2) return { intent: 'search', payload: { keyword: t } }

  return { intent: 'help', payload: null }
}
