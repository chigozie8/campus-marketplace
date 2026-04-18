import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { sendWhatsApp } from '@/lib/whatsapp/wasender'
import {
  getConsent, setConsent, setSessionStatus,
} from '@/lib/whatsapp/consent'
import {
  TOS_PROMPT_MSG, TOS_ACCEPTED_MSG, OPTED_OUT_MSG, OPT_IN_AGAIN_MSG,
  isOptOutKeyword, isOptInKeyword, isYesKeyword,
} from '@/lib/whatsapp/messages'
import { buildReply } from '@/lib/whatsapp/handlers'
import { clearState } from '@/lib/whatsapp/state'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.vendoorx.ng'

// ─── Webhook signature verification (HMAC SHA256) ────────────────────────────
// WaSender variants differ in:
//   • header name  (x-webhook-signature | x-wasender-signature | signature)
//   • signature can be the raw secret token (older WaSender), or
//   • HMAC-SHA256(rawBody) encoded as hex OR base64, with/without sha256= prefix
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
  if (!secret) return process.env.NODE_ENV !== 'production'
  if (!signature) return false

  const sig = signature.replace(/^sha256=/i, '').trim()

  if (safeEqual(sig, secret)) return true
  if (safeEqual(sig, crypto.createHmac('sha256', secret).update(rawBody).digest('hex')))    return true
  if (safeEqual(sig, crypto.createHmac('sha256', secret).update(rawBody).digest('base64'))) return true

  console.warn('[wa-webhook] signature mismatch len=', sig.length)
  return false
}

// ─── Parse WaSender (Baileys-style) webhook ──────────────────────────────────
function extractMessage(body: any): { from: string; text: string } | null {
  if (!body) return null
  const msg = body?.data?.messages?.[0] ?? body?.messages?.[0]
  if (msg) {
    if (msg?.key?.fromMe) return null
    const remoteJid: string = msg?.key?.remoteJid ?? msg?.remoteJid ?? ''
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

// ─── Master message handler with consent flow ────────────────────────────────
async function handleMessage(from: string, text: string) {
  const consent = await getConsent(from)
  console.info(`[wa-in] from=${from.slice(0,4)}***${from.slice(-2)} consent=${consent} text="${text.slice(0,60)}"`)

  // 1) Opt-out keyword always wins
  if (isOptOutKeyword(text)) {
    await setConsent(from, 'opted_out')
    await clearState(from)
    await sendWhatsApp(from, OPTED_OUT_MSG(), { bypassSafety: true })
    return
  }

  // 2) Opt-back-in
  if (consent === 'opted_out') {
    if (isOptInKeyword(text) || isYesKeyword(text)) {
      await setConsent(from, 'accepted')
      await sendWhatsApp(from, OPT_IN_AGAIN_MSG(), { bypassSafety: true })
    }
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
    await sendWhatsApp(
      from,
      `🙏 Before we can chat, I need you to accept our terms.\n\n` +
      `Reply *YES* to continue, *STOP* to opt out, or read the full terms here:\n` +
      `${SITE}/legal/whatsapp-terms`,
    )
    return
  }

  // 5) Accepted — full bot
  try {
    const reply = await buildReply(from, text)
    await sendWhatsApp(from, reply)
  } catch (err: any) {
    console.error('[wa-in] handler threw:', err?.message ?? err)
    await sendWhatsApp(
      from,
      `😓 Something went wrong on our end. Please try again, or reply *support* to talk to a person.`,
    )
  }
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

    const evt = body?.event ?? body?.type ?? 'unknown'
    console.info(`[wa-webhook] event=${evt} keys=${Object.keys(body ?? {}).join(',')}`)

    // Test webhooks from the WaSender dashboard — just ack
    if (evt === 'webhook.test') {
      return new NextResponse('OK', { status: 200 })
    }

    // Track session.status events for the admin dashboard
    if (evt === 'session.status' || evt === 'session.connected' || evt === 'session.disconnected') {
      const status = body?.data?.status ?? body?.status ?? evt.replace('session.', '')
      console.info(`[wa-session] status=${status}`)
      await setSessionStatus(String(status))
    }

    const parsed = extractMessage(body)
    if (!parsed) {
      console.info(`[wa-webhook] no message extracted from event=${evt}; body sample=`,
        JSON.stringify(body).slice(0, 400))
    }
    if (parsed) {
      // Fire & forget — must respond 200 quickly so WaSender doesn't retry
      handleMessage(parsed.from, parsed.text).catch(err =>
        console.error('[wa-handle] unhandled:', err?.message ?? err),
      )
    }

    return new NextResponse('OK', { status: 200 })
  } catch (err: any) {
    console.error('[wa-webhook] threw:', err?.message ?? err)
    return new NextResponse('OK', { status: 200 })
  }
}

export async function GET() {
  return NextResponse.json({
    ok:       true,
    provider: 'wasenderapi',
    hasKey:   Boolean(process.env.WASENDER_API_KEY),
    hasSecret:Boolean(process.env.WASENDER_WEBHOOK_SECRET),
    env:      process.env.NODE_ENV,
  })
}
