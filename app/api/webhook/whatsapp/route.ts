import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ─── Supabase (service role) ─────────────────────────────────────────────────
function svc() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

// ─── Gupshup credentials (env or DB) ────────────────────────────────────────
async function getGupshupCreds(): Promise<{ apiKey: string; appName: string; from: string } | null> {
  const apiKey  = process.env.GUPSHUP_API_KEY
  const appName = process.env.GUPSHUP_APP_NAME
  const from    = process.env.GUPSHUP_PHONE_NUMBER
  if (apiKey && appName && from) return { apiKey, appName, from }

  try {
    const { data } = await svc()
      .from('site_settings')
      .select('key, value')
      .in('key', ['integration_gupshup_api_key', 'integration_gupshup_app_name', 'integration_gupshup_phone_number'])

    const map = Object.fromEntries((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]))
    const k = map['integration_gupshup_api_key']
    const a = map['integration_gupshup_app_name']
    const p = map['integration_gupshup_phone_number']
    if (k && a && p) return { apiKey: k, appName: a, from: p }
  } catch {}
  return null
}

// ─── Send reply via Gupshup ──────────────────────────────────────────────────
async function sendReply(to: string, text: string) {
  const creds = await getGupshupCreds()
  if (!creds) return

  const cleanTo = to.replace(/^\+/, '')
  await fetch('https://api.gupshup.io/wa/api/v1/msg', {
    method: 'POST',
    headers: { apikey: creds.apiKey, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      channel:     'whatsapp',
      source:      creds.from,
      destination: cleanTo,
      message:     JSON.stringify({ isHSM: 'false', type: 'text', text: { body: text } }),
      'src.name':  creds.appName,
    }),
  }).catch(() => {})
}

// ─── Intent detection ────────────────────────────────────────────────────────
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
const SEARCH_KW      = ['shoes','phone','food','laptop','bag','cloth','watch','perfume','electronics','fashion','book','shirt','trouser','dress','sneaker','headphone','earphone','tablet','charger','cable','case','cover','hair','beauty','skincare','makeup','jewellery','jewelry','hoodie','jean','sandal','slipper','wristwatch','sunglasses','wallet','belt']
const MENU_MAP: Record<string, string> = { '1':'search','2':'order','3':'refund','4':'contact seller','5':'how does vendoorx work','6':'agent' }

function detectIntent(raw: string) {
  const t = (MENU_MAP[raw.trim()] ?? raw).trim()
  if (GREETING.test(t))       return { intent: 'greeting',       keyword: '' }
  if (HUMAN.test(t))          return { intent: 'human',          keyword: '' }
  if (RETURN_REFUND.test(t))  return { intent: 'return_refund',  keyword: '' }
  if (CONTACT_SELLER.test(t)) return { intent: 'contact_seller', keyword: '' }
  if (HOW_IT_WORKS.test(t))   return { intent: 'how_it_works',   keyword: '' }
  if (TRACK.test(t))          return { intent: 'track_order',    keyword: '' }
  if (ORDER_STATUS.test(t))   return { intent: 'order_status',   keyword: '' }
  const buyId = t.match(BUY_ID)
  if (buyId)                  return { intent: 'buy',            keyword: buyId[1] }
  if (BUY_WORD.test(t))       return { intent: 'buy_prompt',     keyword: '' }
  if (PRICE_WORD.test(t))     return { intent: 'search',         keyword: t }
  const kw = SEARCH_KW.find(k => t.toLowerCase().includes(k))
  if (kw)                     return { intent: 'search',         keyword: kw }
  if (t.split(' ').length >= 2) return { intent: 'search',       keyword: t }
  return { intent: 'help', keyword: '' }
}

// ─── Response builders ───────────────────────────────────────────────────────
const URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vendoorx.ng'

const GREETING_MSG = () =>
  `👋 Hi! Welcome to *VendoorX* — Nigeria's AI-powered WhatsApp commerce platform.\n\n` +
  `Here's what I can help you with:\n\n` +
  `🔍 *1* — Search for products\n` +
  `📦 *2* — Track / check your order\n` +
  `↩️ *3* — Returns & refunds\n` +
  `🏪 *4* — Contact a seller\n` +
  `❓ *5* — How VendoorX works\n` +
  `🙋 *6* — Talk to a human agent\n\n` +
  `Just type a number or ask me anything! 😊`

const ORDER_STATUS_MSG = () =>
  `📦 *Check Your Order Status*\n\n` +
  `To view your order status, tracking and updates:\n\n` +
  `🔗 ${URL}/dashboard/orders\n\n` +
  `Need more help? Reply *track* for delivery info or *6* to speak with a human agent.`

const TRACK_MSG = () =>
  `🚚 *Track Your Delivery*\n\n` +
  `1️⃣ Log into your VendoorX account\n` +
  `2️⃣ Go to *My Orders*\n` +
  `3️⃣ Click on your order to see delivery updates\n\n` +
  `🔗 ${URL}/dashboard/orders\n\n` +
  `If it's been more than 3 days without an update, reply *3* to raise a dispute.`

const REFUND_MSG = () =>
  `↩️ *Returns & Refunds*\n\n` +
  `• Your payment is held in *escrow* until you confirm delivery\n` +
  `• Raise a dispute within *48 hours* of delivery if there's an issue\n` +
  `• Our team resolves within *24–48 hours*\n\n` +
  `To raise a dispute:\n🔗 ${URL}/dashboard/orders\n\n` +
  `Select the order → tap *Raise Dispute*.\n\nUrgent? Reply *6* for a human agent.`

const CONTACT_SELLER_MSG = () =>
  `🏪 *Contact a Seller*\n\n` +
  `1️⃣ Go to the product listing\n` +
  `2️⃣ Tap *Chat with Seller*\n\n` +
  `🔗 ${URL}/marketplace\n\n` +
  `Never pay outside VendoorX — your money is only safe in our escrow system.`

const HOW_IT_WORKS_MSG = () =>
  `💡 *How VendoorX Works*\n\n` +
  `🛍️ *Buyers* — Browse, buy & pay securely. Money held in escrow until you receive your item.\n\n` +
  `🏪 *Sellers* — List for free, receive orders, get paid to your wallet.\n\n` +
  `🔒 Every transaction is protected. No scams, no fake sellers.\n\n` +
  `🔗 ${URL}\n\nQuestions? Reply *6* for human support.`

const HUMAN_MSG = () =>
  `🙋 *Connecting you to our support team…*\n\n` +
  `Available *Mon–Sat, 8am–8pm*.\n\n` +
  `📧 support@vendoorx.ng\n` +
  `🌐 ${URL}/help\n\n` +
  `We typically respond within *1–2 hours*. Thank you for your patience! 🙏`

const BUY_PROMPT_MSG = () =>
  `🛍️ To buy a product:\n\n` +
  `1️⃣ Search for it first — type a keyword (e.g. "phone", "shoes")\n` +
  `2️⃣ Find what you like in the results\n` +
  `3️⃣ Reply *BUY <product-id>*\n\n` +
  `Or browse: 🔗 ${URL}/marketplace`

const HELP_MSG = () =>
  `🤔 I didn't quite catch that.\n\n` +
  `🔍 Type a product name to search (e.g. *"iPhone"*, *"Adidas shoes"*)\n` +
  `📦 Type *order* to check your order\n` +
  `↩️ Type *refund* for returns help\n` +
  `🙋 Type *agent* to talk to a human\n` +
  `👋 Type *hi* to see the full menu\n\n` +
  `🔗 ${URL}`

const ERROR_MSG = () =>
  `😓 Something went wrong on our end. Please try again in a moment.\n\n` +
  `🔗 ${URL}\n\nFor urgent help, reply *agent*.`

// ─── Product search via Supabase ─────────────────────────────────────────────
async function searchProducts(keyword: string, limit = 5) {
  const { data } = await svc()
    .from('listings')
    .select('id, name, price, description, profiles(full_name)')
    .ilike('name', `%${keyword}%`)
    .eq('status', 'active')
    .limit(limit)
  return data ?? []
}

async function getProduct(id: string) {
  const { data } = await svc()
    .from('listings')
    .select('id, name, price, description, profiles(full_name)')
    .eq('id', id)
    .single()
  return data
}

function buildProductList(products: any[]): string {
  if (!products.length) {
    return `😕 No products found for that search.\n\nTry a different keyword or browse:\n🔗 ${URL}/marketplace`
  }
  const lines = products.map((p, i) => {
    const vendor = (p.profiles as any)?.full_name ?? 'Unknown Vendor'
    const price  = Number(p.price).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })
    return `*${i + 1}. ${p.name}*\n💰 ${price}  |  🏪 ${vendor}\n${String(p.description ?? '').substring(0, 80).trimEnd()}…\n👉 Reply *BUY ${p.id}* to order`
  })
  return `🛍️ Here are the top results:\n\n` + lines.join('\n\n─────────────\n\n') + `\n\n🔗 See more: ${URL}/marketplace`
}

function buildSingleProduct(p: any): string {
  const vendor = (p.profiles as any)?.full_name ?? 'Unknown Vendor'
  const price  = Number(p.price).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })
  return `🛍️ *${p.name}*\n\n💰 ${price}\n🏪 ${vendor}\n📝 ${p.description ?? ''}\n\n✅ Reply *BUY ${p.id}* to order\n🔗 ${URL}/listings/${p.id}`
}

// ─── Main message handler ────────────────────────────────────────────────────
async function handleMessage(from: string, text: string) {
  const { intent, keyword } = detectIntent(text)
  let reply: string

  try {
    switch (intent) {
      case 'greeting':       reply = GREETING_MSG();       break
      case 'order_status':   reply = ORDER_STATUS_MSG();   break
      case 'track_order':    reply = TRACK_MSG();           break
      case 'return_refund':  reply = REFUND_MSG();          break
      case 'contact_seller': reply = CONTACT_SELLER_MSG(); break
      case 'how_it_works':   reply = HOW_IT_WORKS_MSG();   break
      case 'human':          reply = HUMAN_MSG();           break
      case 'buy_prompt':     reply = BUY_PROMPT_MSG();     break

      case 'buy': {
        const product = await getProduct(keyword)
        reply = product ? buildSingleProduct(product) : `❌ Couldn't find that product. Try searching first.`
        break
      }

      case 'search': {
        const products = await searchProducts(keyword)
        reply = buildProductList(products)
        break
      }

      default: reply = HELP_MSG()
    }
  } catch {
    reply = ERROR_MSG()
  }

  await sendReply(from, reply)
}

// ─── Route handlers ──────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null) ?? await req.text().then(t => {
      try { return Object.fromEntries(new URLSearchParams(t)) } catch { return {} }
    })

    if (body?.type === 'message') {
      const payload = body.payload
      const from: string = payload?.sender?.phone ?? payload?.source ?? ''
      const text: string =
        payload?.type === 'text'         ? (payload?.payload?.text  ?? '')
        : payload?.type === 'button_response' ? (payload?.payload?.title ?? '')
        : ''

      if (from && text) {
        handleMessage(from, text).catch(() => {})
      }
    }

    return new NextResponse('OK', { status: 200 })
  } catch {
    return new NextResponse('OK', { status: 200 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, provider: 'gupshup' })
}
