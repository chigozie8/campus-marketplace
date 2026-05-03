/**
 * Bot conversation handlers — VendoorX WhatsApp AI brain v2.
 *
 * Upgrades over v1:
 *  • Nigerian Pidgin + slang detection (abeg, how far, oya, wetin, e don do)
 *  • Time-aware greetings (Good morning / afternoon / evening WAT)
 *  • Levenshtein fuzzy matching — handles typos like "phonne", "sheos"
 *  • Extended brand-aware category hints (iPhone, Samsung, Adidas, etc.)
 *  • Quantity step added before address (e.g. user can order 2 items)
 *  • Broad fallback search — splits query into tokens, finds similar items
 *  • "Back" from product view returns to the previous results list
 *  • All DB calls wrapped in try/catch — bot never crashes on DB errors
 *  • Richer reply messages: dividers, order summaries, status emoji map
 *  • FAQ / how-it-works intent for "how does escrow work?" type questions
 *  • Feedback intent captures reviews/complaints gracefully
 *  • Randomised cancel/ack phrases so replies feel natural
 */

import { createClient } from '@supabase/supabase-js'
import { getState, setState, clearState } from './state'
import { findProfileByPhone, type LinkedProfile } from './account'
import { naira, shortId, truncate, statusLabel, SITE } from './format'

// ─── Supabase service client ──────────────────────────────────────────────────
function svc() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

// ─── Intent types ─────────────────────────────────────────────────────────────
export type Intent =
  | 'greeting' | 'menu'      | 'help'
  | 'browse'   | 'search'    | 'category'
  | 'pick'
  | 'view_product'
  | 'order'    | 'quantity'  | 'address' | 'confirm_order' | 'cancel_flow'
  | 'my_orders'| 'track'
  | 'sell_help'| 'my_sales'
  | 'support'  | 'faq'       | 'feedback'
  | 'unknown'

// ─── Intent regex patterns ────────────────────────────────────────────────────
const RX = {
  greeting: /^\s*(hi+|hello+|hey+|hy|yo+|sup|howdy|start|menu|hiya|heya|helo|hii+|good\s*(morning|afternoon|evening|day|eve)|omo|how\s*far|how\s*now|how\s*body|e\s*don\s*do|oya\s*start|na\s*wa|how\s*are\s*you)\s*[!.?]?\s*$/i,
  menu:     /^\s*(menu|options|help|what can you do|what do you do|commands|list|show me|show options)\s*[!.?]?\s*$/i,
  browse:   /^\s*(browse|categories|category|shop|catalogue|show\s*all|all\s*categories|oya\s*show|oya\s*browse|see\s*all)\s*[!.?]?\s*$/i,
  myOrders: /\b(my orders?|my purchase|order history|orders|show.*order|check.*order|see.*order)\b/i,
  track:    /\b(track|tracking|where.*my order|delivery status|where.*parcel|when.*arrive|when.*come|delivery update)\b/i,
  order:    /^\s*(order|buy|purchase|i want this|i want it|take it|checkout|i go take am|abeg send|i dey buy|make i buy|i'll take it)\s*[!.?]?\s*$/i,
  cancel:   /^\s*(cancel|stop this|nevermind|never mind|exit|back|home|comot|no more|i don go|leave it|forget it|skip|go back|return)\s*[!.?]?\s*$/i,
  confirm:  /^\s*(yes|y|confirm|ok|okay|proceed|go ahead|sure|do it|oya|e go|make am|i agree|yep|yup|deal|correct|ehen|oya now|affirmative|place order)\s*[!.?]?\s*$/i,
  no:       /^\s*(no|n|nope|cancel|nah|naah|no way|i no want|e don do|no go|abeg no|don't|dont)\s*[!.?]?\s*$/i,
  sellHelp: /\b(sell|sale|list\s*(a|my|product)|i want to sell|how to sell|become a seller|how.*sell|i dey sell|make i sell|abeg how.*sell|start selling|begin.*sell)\b/i,
  mySales:  /\b(my sales|my listings|my products|my shop|seller dashboard|my store|check.*sales|see.*sales|sales report)\b/i,
  support:  /\b(human|agent|support|help me|talk to (a |)person|customer (care|service)|complaint|problem|issue|i need help|make.*talk.*person|abeg help|oya help|real person|speak.*agent)\b/i,
  faq:      /\b(how.*work|what is vendoorx|what.*escrow|safe|secure|scam|legit|real|trust|payment|how.*pay|how.*deliver|delivery.*how|is.*safe|any.*scam)\b/i,
  feedback: /\b(feedback|rate|rating|review|complain|suggest|suggestion|bad experience|terrible|great service|excellent|love it|hate it|not happy|impressed)\b/i,
  pickNum:  /^\s*([1-9]|1[0-2])\s*$/,
  quantity: /^\s*([1-9][0-9]?)\s*$/,
}

// ─── Extended product category hints ─────────────────────────────────────────
const CATEGORY_HINTS = [
  // Phones & Electronics
  'phone','iphone','samsung','tecno','itel','infinix','oppo','xiaomi','realme','vivo',
  'laptop','macbook','mac','dell','hp','lenovo','asus','acer','notebook',
  'tablet','ipad','headphone','earphone','airpod','airpods','charger','cable',
  'powerbank','power bank','case','cover','screen','protector','tv','television',
  'speaker','bluetooth','router','modem','smart watch','smartwatch',
  // Fashion
  'shoe','sneaker','sandal','slipper','heel','boot','agbada','senator','kaftan',
  'cloth','shirt','trouser','jean','hoodie','dress','skirt','top','jacket',
  'native','ankara','lace','gown','polo','tshirt','shorts','buba','sokoto',
  'jogger','sweatshirt','cardigan','blazer','suit','underwear','bra','lingerie',
  // Accessories
  'bag','backpack','wallet','purse','watch','wristwatch','sunglasses','belt',
  'jewel','jewellery','bracelet','necklace','ring','earring','bead','cap','hat',
  // Beauty & Personal Care
  'beauty','perfume','makeup','skin','hair','wig','lace wig','frontal','closure',
  'cream','lotion','serum','lipstick','foundation','powder','mascara','eyelash',
  'shampoo','conditioner','nail','deodorant','cologne','fragrance',
  // Food & Groceries
  'food','snack','drink','meal','indomie','noodle','rice','provision','groceries',
  'biscuit','chocolate','juice','water','soft drink','tea','coffee',
  // Books & Education
  'book','textbook','novel','stationery','pen','notebook','calculator','ruler',
  'jotter','biro','exercise book','lecture material','past question',
  // Gaming
  'gaming','console','controller','ps4','ps5','xbox','nintendo','joystick','game',
  // Furniture & Home
  'furniture','chair','table','bed','mattress','shelf','sofa','fan','ac','fridge',
  'microwave','blender','iron','gas','stove','pot','plate','bucket',
  // Services
  'tutorial','lesson','course','service','repair',
]

// ─── Levenshtein distance (typo tolerance) ───────────────────────────────────
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

function fuzzyMatchCategory(input: string): string | null {
  const lower = input.toLowerCase().trim()
  // Exact / partial match first
  const exact = CATEGORY_HINTS.find(c =>
    lower === c ||
    lower === c + 's' ||
    lower.startsWith(c + ' ') ||
    lower.includes(' ' + c) ||
    lower.includes(c),
  )
  if (exact) return exact
  // Fuzzy: allow 1 edit for short words, 2 for longer
  const best = CATEGORY_HINTS.find(c => levenshtein(lower, c) <= (c.length <= 5 ? 1 : 2))
  return best ?? null
}

// ─── Time-aware greeting (West Africa Time = UTC+1) ───────────────────────────
function timeGreeting(): string {
  const h = new Date().getUTCHours() + 1
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// ─── Intent detection ─────────────────────────────────────────────────────────
export function detectIntent(text: string): { intent: Intent; arg?: string } {
  const t = (text ?? '').trim()
  if (!t) return { intent: 'help' }

  if (RX.cancel.test(t))   return { intent: 'cancel_flow' }
  if (RX.greeting.test(t) || RX.menu.test(t)) return { intent: 'greeting' }
  if (RX.browse.test(t))   return { intent: 'browse' }
  if (RX.myOrders.test(t)) return { intent: 'my_orders' }
  if (RX.track.test(t))    return { intent: 'track' }
  if (RX.order.test(t))    return { intent: 'order' }
  if (RX.sellHelp.test(t)) return { intent: 'sell_help' }
  if (RX.mySales.test(t))  return { intent: 'my_sales' }
  if (RX.support.test(t))  return { intent: 'support' }
  if (RX.faq.test(t))      return { intent: 'faq' }
  if (RX.feedback.test(t)) return { intent: 'feedback' }

  // Numeric pick from a list
  const pn = t.match(RX.pickNum)
  if (pn) return { intent: 'pick', arg: pn[1] }

  // Fuzzy category / brand match
  const cat = fuzzyMatchCategory(t)
  if (cat) return { intent: 'search', arg: cat }

  // Any phrase 3+ chars → treat as search
  if (t.length >= 3) return { intent: 'search', arg: t }

  return { intent: 'help' }
}

// ─── Database helpers ─────────────────────────────────────────────────────────
async function searchProducts(keyword: string, limit = 6) {
  try {
    const { data } = await svc()
      .from('products')
      .select('id, title, price, description, images, campus, condition, views, profiles(full_name)')
      .or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`)
      .eq('is_available', true)
      .order('views', { ascending: false })
      .limit(limit)
    return data ?? []
  } catch { return [] }
}

/** Broad fallback: split query into tokens, OR-match each */
async function broadSearch(keyword: string, limit = 4) {
  try {
    const tokens = keyword.split(/\s+/).filter(w => w.length >= 3)
    if (!tokens.length) return []
    const orClause = tokens.map(w => `title.ilike.%${w}%`).join(',')
    const { data } = await svc()
      .from('products')
      .select('id, title, price, description, campus, profiles(full_name)')
      .or(orClause)
      .eq('is_available', true)
      .order('views', { ascending: false })
      .limit(limit)
    return data ?? []
  } catch { return [] }
}

async function getProduct(id: string) {
  try {
    const { data } = await svc()
      .from('products')
      .select('id, title, price, description, images, campus, condition, seller_id, views, profiles(full_name, whatsapp_number)')
      .eq('id', id)
      .maybeSingle()
    return data
  } catch { return null }
}

async function getRecentOrdersForBuyer(buyerId: string, limit = 5) {
  try {
    const { data } = await svc()
      .from('orders')
      .select('id, status, total_amount, created_at, quantity, products(title)')
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false })
      .limit(limit)
    return data ?? []
  } catch { return [] }
}

async function getRecentOrdersForSeller(sellerId: string, limit = 5) {
  try {
    const { data } = await svc()
      .from('orders')
      .select('id, status, total_amount, created_at, quantity, products(title), profiles!orders_buyer_id_fkey(full_name)')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })
      .limit(limit)
    return data ?? []
  } catch { return [] }
}

async function getMyListings(sellerId: string, limit = 5) {
  try {
    const { data } = await svc()
      .from('products')
      .select('id, title, price, is_available, views, created_at')
      .eq('seller_id', sellerId)
      .order('views', { ascending: false })
      .limit(limit)
    return data ?? []
  } catch { return [] }
}

async function createOrder(input: {
  buyerId:  string
  product:  any
  address:  string
  quantity: number
}): Promise<string | null> {
  try {
    const total = Number(input.product.price) * input.quantity
    const { data, error } = await svc()
      .from('orders')
      .insert({
        buyer_id:         input.buyerId,
        seller_id:        input.product.seller_id ?? input.product.profiles?.id,
        product_id:       input.product.id,
        quantity:         input.quantity,
        total_amount:     total,
        currency:         'NGN',
        status:           'pending',
        delivery_address: input.address,
      })
      .select('id')
      .maybeSingle()
    if (error || !data) return null
    return data.id as string
  } catch { return null }
}

// ─── Reply message builders ───────────────────────────────────────────────────

function greeting(profile: LinkedProfile | null): string {
  const firstName = profile?.full_name?.split(' ')[0]
  const salutation = firstName ? `${timeGreeting()}, *${firstName}* 👋` : `${timeGreeting()} 👋`
  const sellerLine = profile?.is_seller
    ? `🏪 *my sales* — your shop dashboard\n`
    : `💼 *sell* — list your first item for free\n`
  return (
    `${salutation} Welcome to *VendoorX* — Nigeria's safest campus marketplace 💚\n\n` +
    `I'm *Vee*, your personal shopping assistant. Here's what I can do:\n\n` +
    `🔍 Search anything — just type it (e.g. "iPhone 13", "Adidas shoes")\n` +
    `🛍️ *browse* — see all categories\n` +
    `📦 *my orders* — check your purchases\n` +
    `🚚 *track* — latest delivery update\n` +
    `${sellerLine}` +
    `❓ *how it works* — escrow & safety explained\n` +
    `🙋 *support* — talk to a real person\n\n` +
    `_Reply *STOP* anytime to opt out._`
  )
}

function help(lastInput?: string): string {
  const context = lastInput
    ? `I didn't quite understand *"${truncate(lastInput, 30)}"*.\n\n`
    : `I'm not sure what you mean.\n\n`
  return (
    `🤔 ${context}` +
    `Here's what you can do:\n\n` +
    `• Type any *product* (e.g. "laptop", "wig", "jeans")\n` +
    `• *browse* — see all categories\n` +
    `• *my orders* — your purchases\n` +
    `• *track* — delivery status\n` +
    `• *sell* — list an item\n` +
    `• *support* — talk to a human\n` +
    `• *menu* — full options list\n\n` +
    `🌐 Or shop on the web: ${SITE}/marketplace`
  )
}

function noResults(kw: string, fallback: any[]): string {
  let msg = `😕 No active listings for *"${truncate(kw, 30)}"* right now.\n\n`
  if (fallback.length) {
    msg += `*You might like these similar items:*\n`
    fallback.forEach((p, i) => {
      msg += `${i + 1}. *${truncate(p.title, 38)}* — ${naira(p.price)}\n`
    })
    msg += `\nReply *1–${fallback.length}* to view, or try a broader keyword.\n`
  } else {
    msg +=
      `Try a broader search (e.g. "phone" instead of "iPhone 14 Pro Max") ` +
      `or *browse* all categories.\n`
  }
  msg += `🌐 ${SITE}/marketplace`
  return msg
}

function productList(items: any[], kw: string): string {
  if (!items.length) return noResults(kw, [])
  const lines = items.map((p, i) => {
    const vendor = (p.profiles as any)?.full_name ?? 'Verified Vendor'
    const loc    = p.campus ? `📍 ${p.campus}  ·  ` : ''
    const cond   = p.condition ? `· ${p.condition.replace(/_/g, ' ')} ` : ''
    return (
      `*${i + 1}. ${p.title}*\n` +
      `   💰 ${naira(p.price)} ${cond}\n` +
      `   ${loc}🏪 ${vendor}\n` +
      `   ${truncate(p.description ?? '', 65)}`
    )
  })
  return (
    `🛍️ *${items.length} result${items.length > 1 ? 's' : ''} for "${truncate(kw, 28)}"*\n\n` +
    lines.join('\n\n') +
    `\n\n👉 Reply *1*–*${items.length}* to view a product in full\n` +
    `🌐 More: ${SITE}/marketplace?q=${encodeURIComponent(kw)}`
  )
}

function productDetail(p: any): string {
  const vendor = (p.profiles as any)?.full_name ?? 'Verified Vendor'
  const cond   = p.condition
    ? p.condition.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
    : 'Good condition'
  const loc    = p.campus ? `\n📍 ${p.campus}` : ''
  const views  = p.views  ? `\n👁 ${p.views} views` : ''
  return (
    `🛍️ *${p.title}*\n` +
    `━━━━━━━━━━━━━━━━\n` +
    `💰 *${naira(p.price)}*\n` +
    `🏷️ Condition: ${cond}${loc}${views}\n` +
    `🏪 Sold by: *${vendor}*\n\n` +
    `${truncate(p.description ?? '', 300)}\n\n` +
    `━━━━━━━━━━━━━━━━\n` +
    `✅ Reply *ORDER* to buy (escrow protected 🔒)\n` +
    `🔙 Reply *back* to return to results\n` +
    `🌐 View online: ${SITE}/products/${p.id}`
  )
}

function askQuantity(p: any): string {
  return (
    `🛒 *${truncate(p.title, 50)}*\n` +
    `💰 ${naira(p.price)} each\n\n` +
    `How many do you want?\n` +
    `Reply with a number — e.g. *1*, *2*, *3*\n\n` +
    `Reply *back* to cancel.`
  )
}

function askAddress(p: any, quantity: number): string {
  const total = Number(p.price) * quantity
  return (
    `📦 *Order summary*\n` +
    `━━━━━━━━━━━━━━━━\n` +
    `🛍️ ${p.title}\n` +
    `🔢 Qty: ${quantity}\n` +
    `💰 Total: *${naira(total)}*\n` +
    `━━━━━━━━━━━━━━━━\n\n` +
    `📍 *Where should we deliver?*\n\n` +
    `Send your full address — include:\n` +
    `• Hostel name / house number\n` +
    `• Street and area\n` +
    `• Campus / city\n\n` +
    `_Example: "Room 5B, Moremi Hall, UNILAG, Yaba, Lagos"_\n\n` +
    `Reply *back* to cancel.`
  )
}

function confirmOrder(p: any, address: string, quantity: number): string {
  const total = Number(p.price) * quantity
  return (
    `🧾 *Confirm your order*\n` +
    `━━━━━━━━━━━━━━━━\n` +
    `🛍️ ${truncate(p.title, 50)}\n` +
    `🔢 Qty: ${quantity}\n` +
    `💰 Total: *${naira(total)}*\n` +
    `📍 Deliver to: ${truncate(address, 100)}\n` +
    `━━━━━━━━━━━━━━━━\n\n` +
    `🔒 Your payment is held in *escrow* until you confirm delivery — 100% safe.\n\n` +
    `Reply *YES* to place order and get your payment link\n` +
    `Reply *NO* to cancel`
  )
}

function paymentMessage(orderId: string, p: any, quantity: number): string {
  const total = Number(p.price) * quantity
  return (
    `✅ *Order placed successfully!*\n\n` +
    `🆔 Reference: *${shortId(orderId)}*\n` +
    `🛍️ ${truncate(p.title, 40)} × ${quantity}\n` +
    `💰 ${naira(total)}\n\n` +
    `━━━━━━━━━━━━━━━━\n` +
    `💳 *Pay securely via Paystack:*\n` +
    `${SITE}/orders/${orderId}/pay\n\n` +
    `🔒 Your money is in *escrow* — the seller only gets paid after you confirm delivery.\n\n` +
    `📦 Track: ${SITE}/dashboard/orders\n` +
    `Or just reply *track* anytime.\n\n` +
    `_Thank you for shopping on VendoorX! 💚_`
  )
}

function notLinkedForOrder(): string {
  return (
    `🔒 *Account needed to order*\n\n` +
    `To place an order, you need a free VendoorX account linked to this WhatsApp number.\n\n` +
    `*3 quick steps:*\n` +
    `1️⃣ Sign up (free): ${SITE}/auth/sign-up\n` +
    `2️⃣ Go to Profile → add this WhatsApp number\n` +
    `3️⃣ Come back and reply *ORDER*\n\n` +
    `Takes less than 2 minutes. We never share your number.\n\n` +
    `Need help? Reply *support*`
  )
}

function ordersList(orders: any[], profile: LinkedProfile | null): string {
  if (!orders.length) {
    const name = profile?.full_name?.split(' ')[0]
    return (
      `📦 *No orders yet${name ? `, ${name}` : ''}*\n\n` +
      `Ready to shop? Just type what you're looking for!\n` +
      `Or reply *browse* to see all categories.\n\n` +
      `🌐 ${SITE}/marketplace`
    )
  }
  const lines = orders.map(o => {
    const t   = (o.products as any)?.title ?? 'Product'
    const qty = o.quantity > 1 ? ` × ${o.quantity}` : ''
    return (
      `• *${shortId(o.id)}* — ${truncate(t, 28)}${qty}\n` +
      `  💰 ${naira(o.total_amount)}  ·  ${statusLabel(o.status)}`
    )
  })
  return (
    `📦 *Your recent orders*\n\n` +
    lines.join('\n\n') +
    `\n\n🔗 Full history: ${SITE}/dashboard/orders`
  )
}

function trackLatest(orders: any[]): string {
  if (!orders.length) {
    return `📦 No active orders to track.\n\nJust type what you want to buy and start shopping!`
  }
  const o = orders[0]
  const t = (o.products as any)?.title ?? 'Product'
  const statusMap: Record<string, string> = {
    pending:   '⏳ Awaiting payment',
    paid:      '✅ Payment confirmed — preparing your order',
    confirmed: '📦 Seller confirmed — getting ready',
    shipped:   '🚚 On the way to you',
    delivered: '🎉 Delivered — enjoy!',
    cancelled: '❌ Cancelled',
    disputed:  '⚠️ Under review by VendoorX',
  }
  return (
    `🚚 *Tracking your latest order*\n\n` +
    `🛍️ ${truncate(t, 50)}\n` +
    `🆔 Ref: ${shortId(o.id)}\n` +
    `💰 ${naira(o.total_amount)}\n` +
    `📍 Status: *${statusMap[o.status] ?? statusLabel(o.status)}*\n\n` +
    `🔗 Full details: ${SITE}/dashboard/orders/${o.id}\n\n` +
    `_Need help with this order? Reply *support*_`
  )
}

function listingsList(items: any[]): string {
  if (!items.length) {
    return (
      `🏪 *No active listings*\n\n` +
      `Start selling in minutes — it's free:\n` +
      `${SITE}/dashboard/listings/new`
    )
  }
  const lines = items.map(p =>
    `• *${truncate(p.title, 38)}*\n` +
    `  ${naira(p.price)}  ·  👁 ${p.views ?? 0} views  ·  ${p.is_available ? '✅ Live' : '⏸ Paused'}`,
  )
  return (
    `🏪 *Your listings*\n\n` +
    lines.join('\n\n') +
    `\n\n✏️ Manage: ${SITE}/dashboard/listings\n` +
    `➕ Add new: ${SITE}/dashboard/listings/new`
  )
}

function sellerOrdersList(orders: any[]): string {
  if (!orders.length) {
    return (
      `📭 *No sales yet*\n\n` +
      `Share your shop link to attract buyers:\n` +
      `${SITE}/dashboard/boost\n\n` +
      `_Tip: Add clear photos and a competitive price to sell faster!_`
    )
  }
  const lines = orders.map(o => {
    const t     = (o.products as any)?.title ?? 'Product'
    const buyer = (o.profiles as any)?.full_name ?? 'A buyer'
    const qty   = o.quantity > 1 ? ` × ${o.quantity}` : ''
    return (
      `• *${shortId(o.id)}* — ${truncate(t, 23)}${qty}\n` +
      `  👤 ${buyer}  ·  ${naira(o.total_amount)}  ·  ${statusLabel(o.status)}`
    )
  })
  return (
    `📈 *Your recent sales*\n\n` +
    lines.join('\n\n') +
    `\n\n🔗 Full dashboard: ${SITE}/dashboard/sales`
  )
}

function browseCategories(): string {
  return (
    `🛍️ *Browse by category*\n\n` +
    `Just type any category name or brand to search:\n\n` +
    `📱 *Phones & Tablets* — iPhone, Samsung, Tecno...\n` +
    `💻 *Laptops & Tech* — Dell, HP, MacBook, accessories\n` +
    `👗 *Fashion* — Clothes, native wear, ankara, gown\n` +
    `👟 *Shoes* — Sneakers, sandals, heels, boots\n` +
    `👜 *Bags & Accessories* — Bags, wallets, watches\n` +
    `💄 *Beauty & Hair* — Skincare, wigs, makeup\n` +
    `📚 *Books & Stationery* — Textbooks, past questions\n` +
    `🍜 *Food & Provisions* — Snacks, drinks, groceries\n` +
    `🎮 *Gaming* — PS4, PS5, controllers\n` +
    `🛋️ *Furniture & Home* — Chairs, beds, appliances\n\n` +
    `👉 Or type exactly what you want (e.g. *"Adidas NMD size 43"*)\n` +
    `🌐 ${SITE}/marketplace`
  )
}

function sellHelp(): string {
  return (
    `💼 *Start selling on VendoorX*\n\n` +
    `It's *free* to list. You only pay a small fee when you make a sale.\n\n` +
    `*How it works:*\n` +
    `1️⃣ Create a free account: ${SITE}/auth/sign-up\n` +
    `2️⃣ Verify with your student ID (2 minutes)\n` +
    `3️⃣ List your product with photos + price\n` +
    `4️⃣ Buyers pay into *escrow* → you get paid on delivery confirmation\n\n` +
    `💚 *Why sell on VendoorX?*\n` +
    `• Free to list — no upfront cost\n` +
    `• Escrow payment — no scam risk\n` +
    `• WhatsApp alerts when you sell\n` +
    `• Your products shown to students on your campus first\n\n` +
    `📲 List your first item now: ${SITE}/dashboard/listings/new`
  )
}

function howItWorks(): string {
  return (
    `🔒 *How VendoorX keeps you safe*\n\n` +
    `*Escrow payment:*\n` +
    `When you order, your payment goes into *secure escrow* — NOT to the seller directly.\n\n` +
    `The seller only receives the money after:\n` +
    `✅ You receive the item\n` +
    `✅ You confirm delivery on VendoorX\n\n` +
    `*What this means for you:*\n` +
    `• Zero scam risk — if it doesn't arrive, you get refunded\n` +
    `• Sellers are motivated to deliver fast and properly\n` +
    `• Disputes are handled by VendoorX support\n\n` +
    `*Payment options:* Debit card, bank transfer (via Paystack)\n` +
    `*Delivery:* Campus riders + trusted courier partners\n\n` +
    `📖 Full guide: ${SITE}/help/how-it-works`
  )
}

function feedbackResponse(): string {
  return (
    `💬 *Thanks for your feedback!*\n\n` +
    `Your input helps us build a better marketplace for Nigerian students.\n\n` +
    `📧 Email: feedback@vendoorx.ng\n` +
    `🌐 Feedback form: ${SITE}/feedback\n\n` +
    `Or describe your experience right here — I'm listening and will pass it along to the team.`
  )
}

function support(): string {
  return (
    `🙋 *Talk to a human*\n\n` +
    `*Response time: 1–2 hours*\n` +
    `Mon–Sat, 8am–9pm WAT\n\n` +
    `📧 Email: support@vendoorx.ng\n` +
    `🌐 Help centre: ${SITE}/help\n\n` +
    `_Please describe your issue and our team will get back to you as soon as possible._`
  )
}

function cancelled(): string {
  const opts = [
    `👍 No problem! Back to the start — type *menu* to see options.`,
    `👌 Okay, cancelled. Just say *hi* when you're ready.`,
    `✅ Done. Type what you're looking for anytime!`,
  ]
  return opts[Math.floor(Math.random() * opts.length)]
}

// ─── Master handler ───────────────────────────────────────────────────────────
export async function buildReply(phone: string, text: string): Promise<string> {
  const [profile, state] = await Promise.all([
    findProfileByPhone(phone),
    getState(phone),
  ])

  const det = detectIntent(text)

  // Universal cancel — always drop in-flight state immediately
  if (det.intent === 'cancel_flow') {
    // Special case: "back" while viewing a product returns to results list
    if (state.step === 'VIEWING_PRODUCT') {
      const { ids, kw } = state.data
      if (ids?.length && kw) {
        const products = (await Promise.all(
          (ids as string[]).slice(0, 6).map((id: string) => getProduct(id)),
        )).filter(Boolean)
        if (products.length) {
          await setState(phone, 'BROWSING_RESULTS', { ids, kw })
          return productList(products, kw)
        }
      }
    }
    await clearState(phone)
    return cancelled()
  }

  // ── Stateful conversation continuations ──────────────────────────────────

  // Step: user is asked how many they want
  if (state.step === 'AWAITING_QUANTITY') {
    const product = state.data.product
    if (!product) { await clearState(phone); return greeting(profile) }
    const qMatch = text.trim().match(RX.quantity)
    if (!qMatch) {
      return `🔢 Please reply with the quantity — e.g. *1*, *2*, *3*.\n\nOr reply *back* to cancel.`
    }
    const quantity = Math.min(Number(qMatch[1]), 20)
    await setState(phone, 'AWAITING_ADDRESS', { product, quantity })
    return askAddress(product, quantity)
  }

  // Step: user is providing delivery address
  if (state.step === 'AWAITING_ADDRESS') {
    const { product, quantity = 1 } = state.data
    if (!product) { await clearState(phone); return greeting(profile) }
    const trimmed = text.trim()
    if (trimmed.length < 10) {
      return (
        `📍 Please send your *full delivery address*.\n\n` +
        `Include hostel/house, street, area and campus.\n\n` +
        `_Example: "Room 12, Block C, Moremi Hall, UNILAG, Yaba"_\n\n` +
        `Or reply *back* to cancel.`
      )
    }
    await setState(phone, 'CONFIRMING_ORDER', { product, address: trimmed, quantity })
    return confirmOrder(product, trimmed, quantity)
  }

  // Step: user is confirming or declining their order
  if (state.step === 'CONFIRMING_ORDER') {
    const { product, address, quantity = 1 } = state.data
    if (RX.confirm.test(text)) {
      if (!product || !address) { await clearState(phone); return greeting(profile) }
      if (!profile) { await clearState(phone); return notLinkedForOrder() }
      const orderId = await createOrder({ buyerId: profile.id, product, address, quantity })
      await clearState(phone)
      if (!orderId) {
        return `😓 Couldn't create your order right now. Please try again, or reply *support* for help.`
      }
      return paymentMessage(orderId, product, quantity)
    }
    if (RX.no.test(text)) {
      await clearState(phone)
      return cancelled()
    }
    return `Please reply *YES* to confirm your order or *NO* to cancel.\n\nOr reply *back* to start over.`
  }

  // Numeric pick from a product results list
  if (det.intent === 'pick' && state.step === 'BROWSING_RESULTS') {
    const idx = Number(det.arg) - 1
    const ids: string[] = state.data.ids ?? []
    const id = ids[idx]
    if (!id) {
      return `Hmm, I don't see option *${det.arg}*. Try *1*–*${ids.length}*, or type a new search.`
    }
    const product = await getProduct(id)
    if (!product) {
      return `That product is no longer available. Try another keyword or *browse* for more.`
    }
    await setState(phone, 'VIEWING_PRODUCT', { product, ids, kw: state.data.kw })
    return productDetail(product)
  }

  // ORDER intent while viewing a product
  if (det.intent === 'order' && state.step === 'VIEWING_PRODUCT') {
    const product = state.data.product
    if (!product) return greeting(profile)
    if (!profile) return notLinkedForOrder()
    await setState(phone, 'AWAITING_QUANTITY', { product })
    return askQuantity(product)
  }

  // ── Fresh intents ─────────────────────────────────────────────────────────

  switch (det.intent) {
    case 'greeting':
    case 'menu': {
      await clearState(phone)
      return greeting(profile)
    }

    case 'browse':
      return browseCategories()

    case 'search': {
      const kw = (det.arg ?? text).trim()
      let results = await searchProducts(kw, 6)

      if (!results.length) {
        // Fallback: broad token-based search
        const broad = await broadSearch(kw, 4)
        if (broad.length) {
          await setState(phone, 'BROWSING_RESULTS', {
            ids: broad.map((r: any) => r.id),
            kw: `${kw} (similar)`,
          })
          return (
            `😕 No exact match for *"${truncate(kw, 30)}"*, but here are similar items:\n\n` +
            productList(broad, kw).split('\n').slice(1).join('\n')
          )
        }
        return noResults(kw, [])
      }

      await setState(phone, 'BROWSING_RESULTS', {
        ids: results.map((r: any) => r.id),
        kw,
      })
      return productList(results, kw)
    }

    case 'order':
      return `🛒 To order, first find what you want — type the product name, or reply *browse*.`

    case 'my_orders': {
      if (!profile) return notLinkedForOrder()
      const orders = await getRecentOrdersForBuyer(profile.id, 5)
      return ordersList(orders, profile)
    }

    case 'track': {
      if (!profile) return notLinkedForOrder()
      const orders = await getRecentOrdersForBuyer(profile.id, 1)
      return trackLatest(orders)
    }

    case 'sell_help':
      return sellHelp()

    case 'my_sales': {
      if (!profile) return notLinkedForOrder()
      const [listings, orders] = await Promise.all([
        getMyListings(profile.id, 5),
        getRecentOrdersForSeller(profile.id, 5),
      ])
      return listingsList(listings) + `\n\n────────\n\n` + sellerOrdersList(orders)
    }

    case 'faq':
      return howItWorks()

    case 'feedback':
      return feedbackResponse()

    case 'support':
      return support()

    default:
      return help(text)
  }
}
