/**
 * Canonical WhatsApp bot messages (consent, opt-out, etc).
 * Centralised so they can be reused by webhook + tests.
 */

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.vendoorx.ng'

export const TOS_PROMPT_MSG = () =>
  `👋 *Welcome to VendoorX!*\n\n` +
  `Before we chat, please accept our WhatsApp Terms:\n\n` +
  `✅ We'll only reply to *your* messages — no spam, ever\n` +
  `✅ Reply *STOP* anytime to opt out\n` +
  `✅ We'll never share your number with third parties\n` +
  `✅ Standard WhatsApp rates may apply\n\n` +
  `📖 Full terms: ${SITE}/legal/whatsapp-terms\n\n` +
  `Reply *YES* to accept and continue, or *STOP* to opt out.`

export const TOS_ACCEPTED_MSG = () =>
  `🎉 *You're all set!*\n\n` +
  `Welcome to VendoorX — Nigeria's safest student marketplace.\n\n` +
  `Type *hi* anytime to see what I can help with, or just tell me what you're looking for.`

export const OPTED_OUT_MSG = () =>
  `👋 *You've been opted out.*\n\n` +
  `We won't message you again. If you change your mind, just say *START* and we'll be back.\n\n` +
  `Thanks for trying VendoorX. Stay safe! 💚`

export const OPT_IN_AGAIN_MSG = () =>
  `🎉 *Welcome back!*\n\n` +
  `You're opted in again. Type *hi* anytime to get started.`

export const RATE_LIMITED_MSG = () =>
  `⏳ Whoa, slow down a bit! You've sent a lot of messages quickly.\n\n` +
  `Please wait a few minutes and try again. For urgent help, email *support@vendoorx.ng*`

// Detect opt-out / opt-in keywords (must be the only word in the message)
export function isOptOutKeyword(text: string): boolean {
  return /^\s*(stop|unsubscribe|cancel|opt[\s-]?out|quit|end)\s*\.?\s*$/i.test(text)
}
export function isOptInKeyword(text: string): boolean {
  return /^\s*(start|subscribe|opt[\s-]?in|resume)\s*\.?\s*$/i.test(text)
}
export function isYesKeyword(text: string): boolean {
  return /^\s*(yes|y|yeah|yep|ok|okay|accept|i accept|agree|i agree|sure)\s*\.?\s*$/i.test(text)
}
