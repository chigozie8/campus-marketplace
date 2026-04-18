import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { sendWhatsApp } from '@/lib/whatsapp/wasender'
import {
  getConsent,
  setConsent,
  setSessionStatus,
} from '@/lib/whatsapp/consent'
import {
  TOS_PROMPT_MSG,
  TOS_ACCEPTED_MSG,
  OPTED_OUT_MSG,
  OPT_IN_AGAIN_MSG,
  isOptOutKeyword,
  isOptInKeyword,
  isYesKeyword,
} from '@/lib/whatsapp/messages'

// ─── Supabase (service role) ─────────────────────────────────────────────────
function svc() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

// ─── Webhook signature verification (HMAC SHA256) ────────────────────────────
// WaSender variants differ in:
//   • header name  (x-webhook-signature | x-wasender-signature | signature)
//   • signature can be the raw secret token (no HMAC at all — older WaSender)
//   • or HMAC-SHA256 of raw body, encoded as hex OR base64, with/without sha256= prefix
// We accept any of these to stay compatible.  Fail-closed in production when
// no secret is configured; permissive in dev for initial setup.
function pickSignature(req: NextRequest): string | null {
  return (
    req.headers.get('x-webhook-signature') ??
    req.headers.get('x-wasender-signature') ??
    req.headers.get('webhook-signature') ??
    req.headers.get('signature') ??
    null
  )
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  try { return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b)) }
  catch { return false }
}

function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.WASENDER_WEBHOOK_SECRET
  if (!secret) {
    return process.env.NODE_ENV !== 'production'
  }
  if (!signature) return false

  const sig = signature.replace(/^sha256=/i, '').trim()

  // Format A: WaSender sends the raw secret token as the signature
  if (safeEqual(sig, secret)) return true

  // Format B: HMAC-SHA256(rawBody) hex
  const hex = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  if (safeEqual(sig, hex)) return true

  // Format C: HMAC-SHA256(rawBody) base64
  const b64 = crypto.createHmac('sha256', secret).update(rawBody).digest('base64')
  if (safeEqual(sig, b64)) return true

  if (process.env.NODE_ENV !== 'production') {
    console.warn('[wa-webhook] signature mismatch — got', sig.slice(0, 12) + '…', 'len=', sig.length)
  }
  return false
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
const URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.vendoorx.ng'

const GREETING_MSG = () =>
  `👋 Hi! Welcome to *VendoorX* — Nigeria's AI-powered WhatsApp commerce platform.\n\n` +
  `Here's what I can help you with:\n\n` +
  `🔍 *1* — Search for products\n📦 *2* — Track / check your order\n↩️ *3* — Returns & refunds\n` +
  `🏪 *4* — Contact a seller\n❓ *5* — How VendoorX works\n🙋 *6* — Talk to a human agent\n\n` +
  `Just type a number or ask me anything! 😊\n\n_Reply *STOP* anytime to opt out._`

const ORDER_STATUS_MSG = () =>
  `📦 *Check Your Order Status*\n\n🔗 ${URL}/dashboard/orders\n\nReply *track* for delivery info or *6* for a human agent.`

const TRACK_MSG = () =>
  `🚚 *Track Your Delivery*\n\n1️⃣ Log in\n2️⃣ Go to *My Orders*\n3️⃣ Tap your order\n\n🔗 ${URL}/dashboard/orders\n\nNo update for 3+ days? Reply *3* to raise a dispute.`

const REFUND_MSG = () =>
  `↩️ *Returns & Refunds*\n\n• Payment is held in *escrow* until you confirm delivery\n• Raise disputes within *48 hours* of delivery\n• Resolved within *24–48 hours*\n\n🔗 ${URL}/dashboard/orders`

const CONTACT_SELLER_MSG = () =>
  `🏪 *Contact a Seller*\n\n1️⃣ Open the product\n2️⃣ Tap *Chat with Seller*\n\n🔗 ${URL}/marketplace\n\n⚠️ Never pay outside VendoorX — escrow protects you.`

const HOW_IT_WORKS_MSG = () =>
  `💡 *How VendoorX Works*\n\n🛍️ Buyers — pay safely, money held in escrow\n🏪 Sellers — list free, get paid to wallet\n🔒 Every transaction protected\n\n🔗 ${URL}`

const HUMAN_MSG = () =>
  `🙋 *Connecting you to support…*\n\nMon–Sat, 8am–8pm\n📧 support@vendoorx.ng\n🌐 ${URL}/help\n\nResponse within 1–2 hours.`

const BUY_PROMPT_MSG = () =>
  `🛍️ To buy:\n1️⃣ Search a keyword (e.g. "phone")\n2️⃣ Find what you like\n3️⃣ Reply *BUY <product-id>*\n\nOr browse: 🔗 ${URL}/marketplace`

const HELP_MSG = () =>
  `🤔 I didn't quite catch that.\n\n🔍 Type a product name to search\n📦 Type *order* for orders\n↩️ Type *refund* for returns\n🙋 Type *agent* for a human\n👋 Type *hi* for the menu\n\n🔗 ${URL}`

const ERROR_MSG = () =>
  `😓 Something went wrong. Please try again in a moment.\n\nFor urgent help, reply *agent*.`

// ─── Product search via Supabase ─────────────────────────────────────────────
async function searchProducts(keyword: string, limit = 5) {
  try {
    const { data } = await svc()
      .from('listings')
      .select('id, name, price, description, profiles(full_name)')
      .ilike('name', `%${keyword}%`)
      .eq('status', 'active')
      .limit(limit)
    return data ?? []
  } catch { return [] }
}

async function getProduct(id: string) {
  try {
    const { data } = await svc()
      .from('listings')
      .select('id, name, price, description, profiles(full_name)')
      .eq('id', id)
      .single()
    return data
  } catch { return null }
}

function buildProductList(products: any[]): string {
  if (!products.length) return `😕 No products found.\n\nTry another keyword or browse:\n🔗 ${URL}/marketplace`
  const lines = products.map((p, i) => {
    const vendor = (p.profiles as any)?.full_name ?? 'Unknown Vendor'
    const price  = Number(p.price).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })
    return `*${i + 1}. ${p.name}*\n💰 ${price}  |  🏪 ${vendor}\n${String(p.description ?? '').substring(0, 80).trimEnd()}…\n👉 *BUY ${p.id}*`
  })
  return `🛍️ Top results:\n\n` + lines.join('\n\n─────────────\n\n') + `\n\n🔗 More: ${URL}/marketplace`
}

function buildSingleProduct(p: any): string {
  const vendor = (p.profiles as any)?.full_name ?? 'Unknown Vendor'
  const price  = Number(p.price).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })
  return `🛍️ *${p.name}*\n\n💰 ${price}\n🏪 ${vendor}\n📝 ${p.description ?? ''}\n\n✅ Reply *BUY ${p.id}* to order\n🔗 ${URL}/listings/${p.id}`
}

// ─── Main intent handler ─────────────────────────────────────────────────────
async function handleIntent(text: string): Promise<string> {
  const { intent, keyword } = detectIntent(text)
  try {
    switch (intent) {
      case 'greeting':       return GREETING_MSG()
      case 'order_status':   return ORDER_STATUS_MSG()
      case 'track_order':    return TRACK_MSG()
      case 'return_refund':  return REFUND_MSG()
      case 'contact_seller': return CONTACT_SELLER_MSG()
      case 'how_it_works':   return HOW_IT_WORKS_MSG()
      case 'human':          return HUMAN_MSG()
      case 'buy_prompt':     return BUY_PROMPT_MSG()
      case 'buy': {
        const product = await getProduct(keyword)
        return product ? buildSingleProduct(product) : `❌ Couldn't find that product.`
      }
      case 'search': {
        const products = await searchProducts(keyword)
        return buildProductList(products)
      }
      default: return HELP_MSG()
    }
  } catch { return ERROR_MSG() }
}

// ─── Master message handler with consent flow ────────────────────────────────
async function handleMessage(from: string, text: string) {
  const consent = await getConsent(from)

  // 1) Opt-out keyword always wins
  if (isOptOutKeyword(text)) {
    await setConsent(from, 'opted_out')
    await sendWhatsApp(from, OPTED_OUT_MSG(), { bypassSafety: true })
    return
  }

  // 2) Opt-back-in
  if (consent === 'opted_out') {
    if (isOptInKeyword(text) || isYesKeyword(text)) {
      await setConsent(from, 'accepted')
      await sendWhatsApp(from, OPT_IN_AGAIN_MSG(), { bypassSafety: true })
    }
    // Anyone else's messages while opted out are silently ignored
    return
  }

  // 3) First-time user — send ToS, ask for YES
  if (consent === 'none') {
    await setConsent(from, 'pending')
    await sendWhatsApp(from, TOS_PROMPT_MSG(), { bypassSafety: true })
    return
  }

  // 4) Pending — they need to accept ToS first
  if (consent === 'pending') {
    if (isYesKeyword(text)) {
      await setConsent(from, 'accepted')
      await sendWhatsApp(from, TOS_ACCEPTED_MSG())
      return
    }
    // Don't loop the full ToS — send a short nudge
    await sendWhatsApp(
      from,
      `🙏 Before we can chat, I need you to accept our terms.\n\n` +
      `Reply *YES* to continue, *STOP* to opt out, or read the full terms here:\n` +
      `${URL}/legal/whatsapp-terms`,
    )
    return
  }

  // 5) Accepted — normal bot flow (with full safety)
  const reply = await handleIntent(text)
  await sendWhatsApp(from, reply)
}

// ─── Parse WaSender (Baileys-style) webhook ──────────────────────────────────
function extractMessage(body: any): { from: string; text: string } | null {
  if (!body) return null
  const msg = body?.data?.messages?.[0] ?? body?.messages?.[0]
  if (msg) {
    if (msg?.key?.fromMe) return null
    const remoteJid: string = msg?.key?.remoteJid ?? msg?.remoteJid ?? ''

    // Skip groups, broadcasts, channels
    if (remoteJid.includes('@g.us') || remoteJid.includes('@broadcast') || remoteJid.includes('@newsletter')) {
      return null
    }

    const phone = remoteJid.split('@')[0] ?? ''
    if (!phone) return null

    const m = msg?.message ?? {}
    const text: string =
      m?.conversation ??
      m?.extendedTextMessage?.text ??
      m?.imageMessage?.caption ??
      m?.videoMessage?.caption ??
      m?.buttonsResponseMessage?.selectedDisplayText ??
      m?.listResponseMessage?.title ??
      ''
    if (!text) return null
    return { from: phone, text }
  }

  const directFrom = body?.from ?? body?.sender ?? body?.phone
  const directText = body?.text ?? body?.message ?? body?.body
  if (directFrom && directText) return { from: String(directFrom), text: String(directText) }
  return null
}

// ─── Route handlers ──────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const rawBody   = await req.text()
    const signature = pickSignature(req)

    if (!verifySignature(rawBody, signature)) {
      return new NextResponse('Invalid signature', { status: 401 })
    }

    let body: any = null
    try { body = JSON.parse(rawBody) } catch { body = {} }

    // Track session.status events for the admin dashboard
    if (body?.event === 'session.status' || body?.type === 'session.status') {
      const status = body?.data?.status ?? body?.status ?? 'unknown'
      await setSessionStatus(String(status))
    }

    const parsed = extractMessage(body)
    if (parsed) {
      handleMessage(parsed.from, parsed.text).catch(() => {})
    }

    // Always 200 quickly so WaSender doesn't retry
    return new NextResponse('OK', { status: 200 })
  } catch {
    return new NextResponse('OK', { status: 200 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, provider: 'wasenderapi' })
}
