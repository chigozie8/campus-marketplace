/**
 * VendoorX WhatsApp commerce bot.
 *
 * Every "Chat on WhatsApp" / "Buy via WhatsApp" CTA on the site routes the
 * buyer to this single bot number. The bot identifies the listing and seller
 * from the prefilled message and brokers the conversation.
 *
 * To change the number, update BOT_WHATSAPP_NUMBER below — every CTA across
 * the marketplace, product page, store page, and seller page picks it up
 * automatically.
 */

/** International format, digits only — must include country code, no '+'. */
export const BOT_WHATSAPP_NUMBER = '15792583013'

/** Display version, for tooltips and admin pages. */
export const BOT_WHATSAPP_DISPLAY = '+1 (579) 258-3013'

/**
 * Build a wa.me URL pointing to the VendoorX bot, with an optional
 * pre-filled message that the bot uses to identify the product/seller.
 */
export function botWhatsappUrl(message?: string): string {
  const base = `https://wa.me/${BOT_WHATSAPP_NUMBER}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
