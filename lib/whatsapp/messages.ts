/**
 * Canonical WhatsApp bot messages — consent, opt-out, rate-limit, system.
 *
 * Centralised here so they are reused by webhook, tests, and admin tools.
 *
 * Upgrades over v1:
 *  • Richer TOS prompt with numbered privacy commitments
 *  • Clearer YES/STOP call-to-action
 *  • Warmer, more human-sounding acceptance + opt-out messages
 *  • Re-opt-in message acknowledges the user was missed
 *  • Rate-limit message includes a cooldown hint and escalation path
 *  • Pending TOS reminder is polite and non-pushy
 *  • isOptOutKeyword / isOptInKeyword / isYesKeyword broadened for Nigerian slang
 */

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.vendoorx.ng'

// ─── Consent & TOS messages ───────────────────────────────────────────────────

export const TOS_PROMPT_MSG = () =>
  `👋 *Welcome to VendoorX!*\n\n` +
  `Before we start, please take 10 seconds to accept our WhatsApp Terms:\n\n` +
  `1️⃣ We only reply to messages *you* send — zero unsolicited messages\n` +
  `2️⃣ Reply *STOP* anytime to permanently opt out — we respect that instantly\n` +
  `3️⃣ Your number is *never* shared with third parties\n` +
  `4️⃣ Standard WhatsApp data rates from your carrier may apply\n` +
  `5️⃣ This bot is operated by VendoorX Nigeria (support@vendoorx.ng)\n\n` +
  `📖 Full terms: ${SITE}/legal/whatsapp-terms\n\n` +
  `━━━━━━━━━━━━━━━━\n` +
  `Reply *YES* to accept and start shopping 🛍️\n` +
  `Reply *STOP* to opt out and never hear from us again.`

export const TOS_ACCEPTED_MSG = () =>
  `🎉 *You're all set — welcome to VendoorX!*\n\n` +
  `Nigeria's safest campus marketplace is now at your fingertips.\n\n` +
  `Here's how to get started:\n` +
  `🔍 Just type what you're looking for (e.g. "iPhone", "sneakers", "wig")\n` +
  `🛍️ Or reply *browse* to see all categories\n` +
  `📦 Reply *menu* anytime to see all options\n\n` +
  `Happy shopping! 💚`

export const TOS_PENDING_REMINDER_MSG = () =>
  `🙏 *Almost there!*\n\n` +
  `To chat with Vee (our bot), I just need you to accept our quick terms first.\n\n` +
  `Reply *YES* to accept and continue\n` +
  `Reply *STOP* to opt out\n\n` +
  `📖 Read the full terms: ${SITE}/legal/whatsapp-terms`

export const OPTED_OUT_MSG = () =>
  `👋 *You've been opted out successfully.*\n\n` +
  `We will not send you any further messages.\n\n` +
  `If you change your mind anytime, just reply *START* and we'll be right here.\n\n` +
  `Thanks for giving VendoorX a try. Stay safe out there! 💚`

export const OPT_IN_AGAIN_MSG = () =>
  `🎉 *Welcome back!*\n\n` +
  `We missed you! You're opted in again.\n\n` +
  `Type *hi* or *menu* to see what I can help with, or just tell me what you're looking for.`

// ─── Rate limiting & abuse messages ──────────────────────────────────────────

export const RATE_LIMITED_MSG = () =>
  `⏳ *Slow down a little!*\n\n` +
  `You've sent quite a few messages in a short time.\n\n` +
  `Please wait *2–3 minutes* and try again.\n\n` +
  `For urgent help, email us directly:\n` +
  `📧 support@vendoorx.ng`

export const GLOBAL_CAP_MSG = () =>
  `😓 *Bot is temporarily busy*\n\n` +
  `Our messaging limit has been reached for today. Please try again in a few hours.\n\n` +
  `For urgent requests:\n` +
  `📧 support@vendoorx.ng\n` +
  `🌐 ${SITE}/help`

export const GENERIC_ERROR_MSG = () =>
  `😓 *Something went wrong on our end — sorry!*\n\n` +
  `Please try again in a moment.\n\n` +
  `If it keeps happening, reply *support* to talk to a real person or email:\n` +
  `📧 support@vendoorx.ng`

// ─── Keyword detection ────────────────────────────────────────────────────────

/** Opt-out keywords — reply with OPTED_OUT_MSG and stop all further messages */
export function isOptOutKeyword(text: string): boolean {
  return /^\s*(stop|unsubscribe|cancel|opt[\s-]?out|quit|end|remove me|delete me|leave me alone|no more messages?|don['']?t (message|text|contact) me|block|bye)\s*[.!?]?\s*$/i.test(text)
}

/** Opt-in / re-subscribe keywords */
export function isOptInKeyword(text: string): boolean {
  return /^\s*(start|subscribe|opt[\s-]?in|resume|re-?subscribe|resubscribe|join|add me back|bring me back|i'm back|i am back)\s*[.!?]?\s*$/i.test(text)
}

/** YES / consent keywords — used during TOS and order confirmation */
export function isYesKeyword(text: string): boolean {
  return /^\s*(yes|y|yeah|yep|yup|ok|okay|accept|i accept|agree|i agree|sure|ehen|oya|confirmed|affirmative|proceed|go ahead|deal|correct|i consent|i do)\s*[.!?]?\s*$/i.test(text)
}
