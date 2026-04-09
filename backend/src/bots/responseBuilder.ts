import { ProductRow } from '../types/index.js'

const APP_URL = process.env.FRONTEND_URL ?? 'https://vendoorx.com'

export function buildGreeting(): string {
  return (
    `👋 Hi! Welcome to *VendoorX* — Nigeria's #1 campus marketplace.\n\n` +
    `Here's what I can help you with:\n\n` +
    `🔍 *1* — Search for products\n` +
    `📦 *2* — Track / check your order\n` +
    `↩️ *3* — Returns & refunds\n` +
    `🏪 *4* — Contact a seller\n` +
    `❓ *5* — How VendoorX works\n` +
    `🙋 *6* — Talk to a human agent\n\n` +
    `Just type a number or ask me anything! 😊`
  )
}

export function buildProductList(products: ProductRow[]): string {
  if (products.length === 0) {
    return (
      `😕 No products found for that search.\n\n` +
      `Try a different keyword (e.g. "shoes", "laptop", "bag") or browse our full marketplace here:\n` +
      `🔗 ${APP_URL}/marketplace`
    )
  }

  const lines = products.map((p, i) => {
    const vendor = (p as unknown as { profiles?: { full_name?: string } }).profiles?.full_name ?? 'Unknown Vendor'
    const price  = Number(p.price).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })
    return (
      `*${i + 1}. ${p.name}*\n` +
      `💰 ${price}  |  🏪 ${vendor}\n` +
      `${(p.description ?? '').substring(0, 80).trimEnd()}…\n` +
      `👉 Reply *BUY ${p.id}* to order`
    )
  })

  return (
    `🛍️ Here are the top results:\n\n` +
    lines.join('\n\n─────────────\n\n') +
    `\n\n🔗 See more: ${APP_URL}/marketplace`
  )
}

export function buildSingleProduct(product: ProductRow): string {
  const vendor = (product as unknown as { profiles?: { full_name?: string } }).profiles?.full_name ?? 'Unknown Vendor'
  const price  = Number(product.price).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })

  return (
    `🛍️ *${product.name}*\n\n` +
    `💰 Price: ${price}\n` +
    `🏪 Seller: ${vendor}\n` +
    `📝 ${product.description ?? ''}\n\n` +
    `✅ Ready to order? Reply *BUY ${product.id}*\n` +
    `🔗 View listing: ${APP_URL}/listings/${product.id}`
  )
}

export function buildBuyPrompt(): string {
  return (
    `🛍️ To buy a product:\n\n` +
    `1️⃣ Search for it first — just type a keyword (e.g. "phone", "shoes")\n` +
    `2️⃣ Find what you want in the results\n` +
    `3️⃣ Reply *BUY <product-id>*\n\n` +
    `Or browse our marketplace:\n🔗 ${APP_URL}/marketplace`
  )
}

export function buildOrderStatus(): string {
  return (
    `📦 *Check Your Order Status*\n\n` +
    `To view your order status, tracking, and updates:\n\n` +
    `🔗 ${APP_URL}/dashboard/orders\n\n` +
    `You'll see all your orders, delivery status, and can chat with the seller directly from there.\n\n` +
    `Need more help? Reply *track* for delivery info or *6* to speak with a human agent.`
  )
}

export function buildTrackOrder(): string {
  return (
    `🚚 *Track Your Delivery*\n\n` +
    `Here's how to track your order:\n\n` +
    `1️⃣ Log into your VendoorX account\n` +
    `2️⃣ Go to *My Orders*\n` +
    `3️⃣ Click on your order to see delivery updates\n\n` +
    `🔗 ${APP_URL}/dashboard/orders\n\n` +
    `Your seller is also notified to update the delivery status. If it's been more than 3 days without an update, reply *3* to raise a dispute.`
  )
}

export function buildReturnRefund(): string {
  return (
    `↩️ *Returns & Refunds*\n\n` +
    `We've got you covered! Here's how it works:\n\n` +
    `• Your payment is held in *escrow* until you confirm delivery\n` +
    `• If there's an issue, raise a dispute within *48 hours* of delivery\n` +
    `• Our team reviews and resolves within *24–48 hours*\n\n` +
    `To raise a dispute:\n` +
    `🔗 ${APP_URL}/dashboard/orders\n\n` +
    `Select the order → tap *Raise Dispute* and describe the issue.\n\n` +
    `Need urgent help? Reply *6* to talk to a human agent.`
  )
}

export function buildContactSeller(): string {
  return (
    `🏪 *Contact a Seller*\n\n` +
    `You can message any seller directly on VendoorX:\n\n` +
    `1️⃣ Go to the product listing\n` +
    `2️⃣ Tap *Chat with Seller*\n` +
    `3️⃣ Or go to your order and use the order chat\n\n` +
    `🔗 ${APP_URL}/marketplace\n\n` +
    `All chats are saved and protected. Never pay outside VendoorX — your money is only safe in our escrow system.`
  )
}

export function buildHowItWorks(): string {
  return (
    `💡 *How VendoorX Works*\n\n` +
    `VendoorX is a campus marketplace for Nigerian students:\n\n` +
    `🛍️ *Buyers* — Browse, buy, and pay securely. Money is held in escrow until you receive your item.\n\n` +
    `🏪 *Sellers* — List your products for free, receive orders, and get paid straight to your wallet.\n\n` +
    `🔒 *Secure* — Every transaction is protected. No scams, no fake sellers.\n\n` +
    `📲 *Get started:*\n` +
    `🔗 ${APP_URL}\n\n` +
    `Questions? Just ask me anything or reply *6* for human support.`
  )
}

export function buildHumanHandoff(): string {
  return (
    `🙋 *Connecting you to our support team…*\n\n` +
    `Our team is available *Mon–Sat, 8am–8pm*.\n\n` +
    `📧 Email: support@vendoorx.com\n` +
    `🌐 Help centre: ${APP_URL}/help\n\n` +
    `You can also raise a ticket directly from your dashboard:\n` +
    `🔗 ${APP_URL}/dashboard\n\n` +
    `We typically respond within *1–2 hours* during working hours. Thank you for your patience! 🙏`
  )
}

export function buildOrderCreated(order: {
  id: string
  total_amount: number
  status: string
  product?: { name: string } | null
  product_id: string
}): string {
  const price = Number(order.total_amount).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })
  return (
    `✅ *Order Created Successfully!*\n\n` +
    `📦 Product: ${order.product?.name ?? order.product_id}\n` +
    `💰 Total: ${price}\n` +
    `🆔 Order ID: ${order.id}\n` +
    `📋 Status: ${order.status}\n\n` +
    `Complete your payment here:\n` +
    `🔗 ${APP_URL}/dashboard/orders\n\n` +
    `Your payment is secured by VendoorX escrow — funds only release when you confirm delivery. 🔒`
  )
}

export function buildHelp(): string {
  return (
    `🤔 I didn't quite catch that.\n\n` +
    `Here's what you can do:\n\n` +
    `🔍 Type a product name to search (e.g. *"iPhone"*, *"Adidas shoes"*)\n` +
    `📦 Type *order* to check your order\n` +
    `↩️ Type *refund* for returns help\n` +
    `🙋 Type *agent* to talk to a human\n` +
    `👋 Type *hi* to see the full menu\n\n` +
    `Or visit: 🔗 ${APP_URL}`
  )
}

export function buildError(): string {
  return (
    `😓 Oops! Something went wrong on our end.\n\n` +
    `Please try again in a moment, or visit:\n🔗 ${APP_URL}\n\n` +
    `For urgent help, reply *agent* to talk to our support team.`
  )
}
