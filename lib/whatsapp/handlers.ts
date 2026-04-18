/**
 * Bot conversation handlers — one function per intent.
 * Returns the text to send back, and may mutate conversation state.
 */

import { createClient } from '@supabase/supabase-js'
import { getState, setState, clearState } from './state'
import { findProfileByPhone, type LinkedProfile } from './account'
import { naira, shortId, truncate, statusLabel, SITE } from './format'

function svc() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

// ────────────────────────────────────────────────────────────────────
// Intent detection
// ────────────────────────────────────────────────────────────────────
export type Intent =
  | 'greeting'  | 'menu'      | 'help'
  | 'browse'    | 'search'    | 'category'
  | 'pick'      // numeric pick from a previous list
  | 'view_product'
  | 'order'     | 'address'   | 'confirm_order'  | 'cancel_flow'
  | 'my_orders' | 'track'
  | 'sell_help' | 'my_sales'
  | 'support'

const RX = {
  greeting:  /^\s*(hi|hello|hey|hy|yo|sup|good\s*(morning|afternoon|evening|day)|howdy|start|menu)\s*[!.?]?\s*$/i,
  menu:      /^\s*(menu|options|help|what can you do|what do you do|commands)\s*[!.?]?\s*$/i,
  browse:    /^\s*(browse|categories|category|shop|catalogue)\s*[!.?]?\s*$/i,
  myOrders:  /\b(my orders?|my purchase|order history|orders)\b/i,
  track:     /\b(track|tracking|where('?s| is) my order|delivery status)\b/i,
  order:     /^\s*(order|buy|purchase|i want this|take it|checkout)\s*[!.?]?\s*$/i,
  cancel:    /^\s*(cancel|stop this|nevermind|never mind|exit|back|home)\s*[!.?]?\s*$/i,
  confirm:   /^\s*(yes|y|confirm|ok|okay|proceed|go ahead|sure|do it)\s*[!.?]?\s*$/i,
  no:        /^\s*(no|n|nope|cancel)\s*[!.?]?\s*$/i,
  sellHelp:  /\b(sell|sale|list (a|my)|i want to sell|how to sell|become a seller)\b/i,
  mySales:   /\b(my sales|my listings|my products|my shop|seller dashboard)\b/i,
  support:   /\b(human|agent|support|help me|talk to (a |)person|customer (care|service)|complaint|problem|issue)\b/i,
  pickNum:   /^\s*([1-9]|10)\s*$/,
}

const CATEGORY_HINTS = [
  'phone','laptop','tablet','headphone','earphone','charger','cable','case','tv',
  'shoe','sneaker','sandal','slipper','heel',
  'cloth','shirt','trouser','jean','hoodie','dress','skirt','top','jacket','wear',
  'bag','backpack','wallet','watch','wristwatch','sunglasses','belt','jewel','jewellery',
  'food','snack','drink','meal',
  'book','textbook','novel','stationery',
  'beauty','perfume','makeup','skin','hair','wig',
  'gaming','console','controller',
  'furniture','chair','table','bed',
]

export function detectIntent(text: string): { intent: Intent; arg?: string } {
  const t = (text ?? '').trim()
  if (!t) return { intent: 'help' }

  if (RX.cancel.test(t))    return { intent: 'cancel_flow' }
  if (RX.greeting.test(t) || RX.menu.test(t)) return { intent: 'greeting' }
  if (RX.browse.test(t))    return { intent: 'browse' }
  if (RX.myOrders.test(t))  return { intent: 'my_orders' }
  if (RX.track.test(t))     return { intent: 'track' }
  if (RX.order.test(t))     return { intent: 'order' }
  if (RX.sellHelp.test(t))  return { intent: 'sell_help' }
  if (RX.mySales.test(t))   return { intent: 'my_sales' }
  if (RX.support.test(t))   return { intent: 'support' }

  // Numeric quick-pick from a list shown previously
  const pn = t.match(RX.pickNum)
  if (pn) return { intent: 'pick', arg: pn[1] }

  // Single-word category match
  const lower = t.toLowerCase()
  const cat = CATEGORY_HINTS.find(c => lower === c || lower === c + 's' || lower.includes(' ' + c) || lower.startsWith(c + ' '))
  if (cat) return { intent: 'search', arg: cat }

  // Fall back: any 2+ words → treat as search
  if (t.split(/\s+/).length >= 1 && t.length >= 3) return { intent: 'search', arg: t }
  return { intent: 'help' }
}

// ────────────────────────────────────────────────────────────────────
// DB helpers
// ────────────────────────────────────────────────────────────────────
async function searchProducts(keyword: string, limit = 5) {
  const { data } = await svc()
    .from('products')
    .select('id, title, price, description, images, campus, profiles(full_name)')
    .or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`)
    .eq('is_available', true)
    .order('created_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

async function getProduct(id: string) {
  const { data } = await svc()
    .from('products')
    .select('id, title, price, description, images, campus, condition, profiles(full_name, whatsapp_number)')
    .eq('id', id)
    .maybeSingle()
  return data
}

async function getRecentOrdersForBuyer(buyerId: string, limit = 5) {
  const { data } = await svc()
    .from('orders')
    .select('id, status, total_amount, created_at, products(title)')
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

async function getRecentOrdersForSeller(sellerId: string, limit = 5) {
  const { data } = await svc()
    .from('orders')
    .select('id, status, total_amount, created_at, products(title), profiles!orders_buyer_id_fkey(full_name)')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

async function getMyListings(sellerId: string, limit = 5) {
  const { data } = await svc()
    .from('products')
    .select('id, title, price, is_available, views, created_at')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

async function createOrder(input: {
  buyerId:  string
  product:  any
  address:  string
  quantity: number
}): Promise<string | null> {
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
}

// ────────────────────────────────────────────────────────────────────
// Reply builders
// ────────────────────────────────────────────────────────────────────
function greeting(profile: LinkedProfile | null): string {
  const name = profile?.full_name?.split(' ')[0]
  const hello = name ? `Hi *${name}*` : `👋 Hi there`
  return (
    `${hello}, welcome to *VendoorX* — Nigeria's safest student marketplace 💚\n\n` +
    `What would you like to do?\n\n` +
    `🔍 Type a *product name* to search (e.g. "phone", "shoes")\n` +
    `🛍️ *browse* — see all categories\n` +
    `📦 *my orders* — check your orders\n` +
    `🚚 *track* — latest delivery status\n` +
    (profile?.is_seller ? `🏪 *my sales* — your shop activity\n` : `💼 *sell* — start selling on VendoorX\n`) +
    `🙋 *support* — talk to a human\n\n` +
    `_Reply *STOP* anytime to opt out._`
  )
}

function help(): string {
  return (
    `🤔 I'm not sure what you mean. Try one of these:\n\n` +
    `• Type a product name (e.g. "iPhone", "shoes", "wig")\n` +
    `• *browse* — categories\n` +
    `• *my orders* — your purchases\n` +
    `• *menu* — full options\n` +
    `• *support* — talk to a person\n\n` +
    `🌐 Or browse on the web: ${SITE}/marketplace`
  )
}

function noResults(kw: string): string {
  return (
    `😕 No active products match *"${truncate(kw, 30)}"* right now.\n\n` +
    `Try a broader keyword or *browse* for categories.\n` +
    `🌐 ${SITE}/marketplace`
  )
}

function productList(items: any[], kw: string): string {
  if (!items.length) return noResults(kw)
  const lines = items.map((p, i) => {
    const vendor = (p.profiles as any)?.full_name ?? 'Verified Vendor'
    const where  = p.campus ? `📍 ${p.campus}  ·  ` : ''
    return (
      `*${i + 1}. ${p.title}*\n` +
      `   💰 ${naira(p.price)}\n` +
      `   ${where}🏪 ${vendor}\n` +
      `   ${truncate(p.description ?? '', 70)}`
    )
  })
  return (
    `🛍️ *Top results for "${truncate(kw, 30)}"*\n\n` +
    lines.join('\n\n') +
    `\n\n👉 Reply *1*, *2*, *3*… to view a product\n` +
    `🌐 More: ${SITE}/marketplace`
  )
}

function productDetail(p: any): string {
  const vendor = (p.profiles as any)?.full_name ?? 'Verified Vendor'
  const cond   = p.condition ? p.condition.replace('_', ' ') : 'good'
  const where  = p.campus ? `\n📍 ${p.campus}` : ''
  return (
    `🛍️ *${p.title}*\n\n` +
    `💰 ${naira(p.price)}\n` +
    `🏷️ Condition: ${cond}${where}\n` +
    `🏪 Sold by: ${vendor}\n\n` +
    `${truncate(p.description ?? '', 280)}\n\n` +
    `✅ Reply *ORDER* to buy now (escrow protected)\n` +
    `🔄 Reply *back* to see other results\n` +
    `🌐 View online: ${SITE}/products/${p.id}`
  )
}

function askAddress(p: any): string {
  return (
    `📦 *Order: ${p.title}*\n` +
    `💰 Total: ${naira(p.price)}\n\n` +
    `Where should we deliver?\n\n` +
    `Reply with your *full delivery address* (hostel/house, street, area, campus). Be specific so the rider finds you fast.`
  )
}

function confirmOrder(p: any, address: string): string {
  return (
    `🧾 *Please confirm your order*\n\n` +
    `🛍️ ${p.title}\n` +
    `💰 ${naira(p.price)}\n` +
    `📍 ${truncate(address, 120)}\n\n` +
    `Reply *YES* to place the order and get a payment link.\n` +
    `Reply *NO* to cancel.`
  )
}

function paymentMessage(orderId: string, p: any): string {
  return (
    `✅ *Order placed!*\n` +
    `Reference: *${shortId(orderId)}*\n\n` +
    `Pay securely via Paystack — your money is held in *escrow* until you confirm delivery.\n\n` +
    `💳 Pay: ${SITE}/orders/${orderId}/pay\n\n` +
    `📦 Track your order: ${SITE}/dashboard/orders\n` +
    `Or just reply *track* anytime.`
  )
}

function notLinkedForOrder(): string {
  return (
    `🔒 *Almost there!*\n\n` +
    `To place an order, you need a free VendoorX account linked to this WhatsApp number.\n\n` +
    `1️⃣ Sign up here: ${SITE}/auth/sign-up\n` +
    `2️⃣ Add this WhatsApp number to your profile\n` +
    `3️⃣ Come back and reply *ORDER* again\n\n` +
    `Takes < 2 minutes. We'll never share your number.`
  )
}

function ordersList(orders: any[]): string {
  if (!orders.length) {
    return (
      `📦 *You have no orders yet.*\n\n` +
      `Type a product name to start shopping!\n` +
      `🌐 ${SITE}/marketplace`
    )
  }
  const lines = orders.map(o => {
    const t = (o.products as any)?.title ?? 'Product'
    return `• *${shortId(o.id)}* — ${truncate(t, 30)}\n  ${naira(o.total_amount)}  ·  ${statusLabel(o.status)}`
  })
  return (
    `📦 *Your recent orders*\n\n` +
    lines.join('\n\n') +
    `\n\n🔗 Full history: ${SITE}/dashboard/orders`
  )
}

function trackLatest(orders: any[]): string {
  if (!orders.length) return `📦 No active orders to track. Type a product name to start shopping!`
  const o = orders[0]
  const t = (o.products as any)?.title ?? 'Product'
  return (
    `🚚 *Tracking your latest order*\n\n` +
    `🛍️ ${t}\n` +
    `🆔 ${shortId(o.id)}\n` +
    `💰 ${naira(o.total_amount)}\n` +
    `📍 Status: ${statusLabel(o.status)}\n\n` +
    `Full details: ${SITE}/dashboard/orders/${o.id}`
  )
}

function listingsList(items: any[]): string {
  if (!items.length) {
    return (
      `🏪 You haven't listed any products yet.\n\n` +
      `Start selling: ${SITE}/dashboard/listings/new`
    )
  }
  const lines = items.map(p =>
    `• *${truncate(p.title, 40)}*\n  ${naira(p.price)}  ·  👁 ${p.views} views  ·  ${p.is_available ? '✅ live' : '⏸ paused'}`,
  )
  return (
    `🏪 *Your listings*\n\n` +
    lines.join('\n\n') +
    `\n\n🔗 Manage: ${SITE}/dashboard/listings`
  )
}

function sellerOrdersList(orders: any[]): string {
  if (!orders.length) {
    return (
      `📭 No sales yet.\n\n` +
      `Promote your shop: ${SITE}/dashboard/boost`
    )
  }
  const lines = orders.map(o => {
    const t = (o.products as any)?.title ?? 'Product'
    const buyer = (o.profiles as any)?.full_name ?? 'A buyer'
    return `• *${shortId(o.id)}* — ${truncate(t, 25)}\n  👤 ${buyer}  ·  ${naira(o.total_amount)}  ·  ${statusLabel(o.status)}`
  })
  return (
    `📈 *Your recent sales*\n\n` +
    lines.join('\n\n') +
    `\n\n🔗 Full dashboard: ${SITE}/dashboard/sales`
  )
}

const SELL_HELP = () =>
  `💼 *Start selling on VendoorX*\n\n` +
  `It's free and takes 2 minutes:\n\n` +
  `1️⃣ Create your account: ${SITE}/auth/sign-up\n` +
  `2️⃣ Verify with your student ID\n` +
  `3️⃣ List your first product: ${SITE}/dashboard/listings/new\n\n` +
  `💚 You keep 100% of sales — VendoorX only takes a small fee on completed orders.\n` +
  `🔒 Buyers pay into escrow → released to you on delivery.`

const SUPPORT = () =>
  `🙋 *Support*\n\n` +
  `Mon–Sat, 8am–8pm WAT\n` +
  `📧 support@vendoorx.ng\n` +
  `🌐 ${SITE}/help\n\n` +
  `Reply with details and a real person will follow up within 1–2 hours.`

const CANCELLED = () =>
  `👍 Cancelled. You're back at the start — type *menu* anytime to see options.`

// ────────────────────────────────────────────────────────────────────
// Master handler
// ────────────────────────────────────────────────────────────────────
export async function buildReply(phone: string, text: string): Promise<string> {
  const profile = await findProfileByPhone(phone)
  const state   = await getState(phone)
  const det     = detectIntent(text)

  // Universal cancel — drop any in-flight flow
  if (det.intent === 'cancel_flow') {
    await clearState(phone)
    return CANCELLED()
  }

  // ── Stateful continuations first ──────────────────────────────
  // Quantity step is unused in the simple flow (always 1); we go straight to address.

  if (state.step === 'AWAITING_ADDRESS') {
    const product = state.data.product
    if (!product) { await clearState(phone); return greeting(profile) }
    const trimmed = text.trim()
    if (trimmed.length < 10) {
      return `📍 Please send your *full* delivery address (hostel/house, street, area, campus). At least 10 characters.`
    }
    await setState(phone, 'CONFIRMING_ORDER', { product, address: trimmed, quantity: 1 })
    return confirmOrder(product, trimmed)
  }

  if (state.step === 'CONFIRMING_ORDER') {
    if (RX.confirm.test(text)) {
      const { product, address } = state.data
      if (!product || !address) { await clearState(phone); return greeting(profile) }
      if (!profile) { await clearState(phone); return notLinkedForOrder() }
      const orderId = await createOrder({
        buyerId: profile.id, product, address, quantity: 1,
      })
      await clearState(phone)
      if (!orderId) return `😓 Couldn't create your order. Please try again, or reply *support* for help.`
      return paymentMessage(orderId, product)
    }
    if (RX.no.test(text)) {
      await clearState(phone)
      return CANCELLED()
    }
    return `Please reply *YES* to confirm or *NO* to cancel.`
  }

  // Numeric pick from a previous result list / category list
  if (det.intent === 'pick' && state.step === 'BROWSING_RESULTS') {
    const idx = Number(det.arg) - 1
    const ids: string[] = state.data.ids ?? []
    const id = ids[idx]
    if (!id) return `Hmm, I don't see option *${det.arg}*. Try *1*–*${ids.length}* or *back*.`
    const product = await getProduct(id)
    if (!product) return `That product is no longer available. Try another keyword.`
    await setState(phone, 'VIEWING_PRODUCT', { product })
    return productDetail(product)
  }

  // ORDER while viewing a product
  if (det.intent === 'order' && state.step === 'VIEWING_PRODUCT') {
    const product = state.data.product
    if (!product) return greeting(profile)
    if (!profile) return notLinkedForOrder()
    await setState(phone, 'AWAITING_ADDRESS', { product })
    return askAddress(product)
  }

  // ── Fresh intents ─────────────────────────────────────────────
  switch (det.intent) {
    case 'greeting':
    case 'menu': {
      await clearState(phone)
      return greeting(profile)
    }
    case 'browse':
      return (
        `🛍️ *Popular categories*\n\n` +
        `• Phones & Tablets\n• Laptops & Tech\n• Fashion (men/women)\n• Shoes & Sneakers\n` +
        `• Beauty & Hair\n• Bags & Accessories\n• Books & Stationery\n• Food & Snacks\n` +
        `• Furniture\n\n` +
        `👉 Just type any category, or even a brand name (e.g. *iPhone 12*, *Adidas*).`
      )
    case 'search': {
      const kw = det.arg ?? text
      const results = await searchProducts(kw, 5)
      if (results.length) {
        await setState(phone, 'BROWSING_RESULTS', { ids: results.map(r => r.id), kw })
      }
      return productList(results, kw)
    }
    case 'order': {
      // User said "order" without viewing a product first
      return `🛒 To order, first search for what you want (type a product name) or reply *browse*.`
    }
    case 'my_orders': {
      if (!profile) return notLinkedForOrder()
      const orders = await getRecentOrdersForBuyer(profile.id, 5)
      return ordersList(orders)
    }
    case 'track': {
      if (!profile) return notLinkedForOrder()
      const orders = await getRecentOrdersForBuyer(profile.id, 1)
      return trackLatest(orders)
    }
    case 'sell_help':
      return SELL_HELP()
    case 'my_sales': {
      if (!profile) return notLinkedForOrder()
      const [listings, orders] = await Promise.all([
        getMyListings(profile.id, 5),
        getRecentOrdersForSeller(profile.id, 5),
      ])
      return listingsList(listings) + `\n\n────────\n\n` + sellerOrdersList(orders)
    }
    case 'support':
      return SUPPORT()
    default:
      return help()
  }
}
