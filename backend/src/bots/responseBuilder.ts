import { ProductRow } from '../types/index.js'

export function buildGreeting(): string {
  return (
    `👋 Welcome to *VendorX*!\n\n` +
    `I can help you:\n` +
    `- 🔍 Search for products (type a keyword like "shoes" or "laptop")\n` +
    `- 🛍️ Buy a product (reply *BUY <id>*)\n` +
    `- 💰 Check prices\n\n` +
    `What are you looking for today?`
  )
}

export function buildProductList(products: ProductRow[]): string {
  if (products.length === 0) {
    return `😕 No products found for that search. Try a different keyword.`
  }

  const lines = products.map((p) => {
    const vendor = (p as unknown as { profiles?: { full_name?: string } }).profiles?.full_name ?? 'Unknown Vendor'
    const price = Number(p.price).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })
    return (
      `🛍️ *${p.name}*\n` +
      `💰 ${price}\n` +
      `📍 ${vendor}\n` +
      `📝 ${(p.description ?? '').substring(0, 80)}...\n\n` +
      `👉 Reply *BUY ${p.id}* to purchase`
    )
  })

  return `Here are some products for you:\n\n` + lines.join('\n\n─────────────\n\n')
}

export function buildSingleProduct(product: ProductRow): string {
  const vendor = (product as unknown as { profiles?: { full_name?: string } }).profiles?.full_name ?? 'Unknown Vendor'
  const price = Number(product.price).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })

  return (
    `🛍️ *${product.name}*\n` +
    `💰 ${price}\n` +
    `📍 ${vendor}\n` +
    `📝 ${product.description ?? ''}\n\n` +
    `Reply *BUY ${product.id}* to purchase`
  )
}

export function buildBuyPrompt(): string {
  return `To buy a product, reply with: *BUY <product-id>*\n\nSearch first by typing a keyword like "shoes" or "phone".`
}

export function buildOrderCreated(order: { id: string; total_amount: number; status: string; product?: { name: string } | null; product_id: string }): string {
  const price = Number(order.total_amount).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })
  return (
    `✅ Your order has been created!\n\n` +
    `*Order ID:* ${order.id}\n` +
    `*Product:* ${order.product?.name ?? order.product_id}\n` +
    `*Total:* ${price}\n` +
    `*Status:* ${order.status}\n\n` +
    `Please log in to the VendorX app to complete payment.`
  )
}

export function buildOrderStatusHelp(): string {
  return `To check your order status, please log in to the VendorX app and visit *My Orders*.`
}

export function buildHelp(): string {
  return (
    `I didn't quite understand that. Here's what you can do:\n\n` +
    `- Type a product name to search (e.g., "iPhone")\n` +
    `- Type *BUY <id>* to start a purchase\n` +
    `- Type *hi* to restart\n\n` +
    `Need more help? Contact support.`
  )
}

export function buildError(): string {
  return `Oops! Something went wrong on our end. Please try again in a moment.`
}
