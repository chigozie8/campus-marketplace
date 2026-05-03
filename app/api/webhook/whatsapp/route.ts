/**
 * WhatsApp webhook — VendoorX v2.
 *
 * Improvements over v1:
 *  • Message-ID idempotency  — WasenderAPI sometimes retries; we dedupe by msgId
 *  • Richer event parsing    — handles Baileys v6, v7, and direct-format payloads
 *  • Activity tracking       — records last-seen + inbound count per user
 *  • TOS pending reminder    — politer re-prompt using centralised messages.ts copy
 *  • RATE_LIMITED_MSG sent   — user gets a friendly message when rate-blocked
 *  • GLOBAL_CAP_MSG sent     — user gets a friendly message when global cap hit
 *  • GENERIC_ERROR_MSG sent  — always send something on unhandled errors
 *  • GET health check        — returns live session + stats for admin dashboard
 *  • Timing-safe sig verify  — unchanged (already solid in v1)
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { sendWhatsApp } from '@/lib/whatsapp/wasender'
import {
  getConsent,
  setConsent,
  setSessionStatus,
  isAlreadyProcessed,
  recordActivity,
  incrementInboundCount,
  getSessionStatus,
  getInboundStats,
  getGlobalDailyCount,
} from '@/lib/whatsapp/consent'
import {
  TOS_PROMPT_MSG,
  TOS_ACCEPTED_MSG,
  TOS_PENDING_REMINDER_MSG,
  OPTED_OUT_MSG,
  OPT_IN_AGAIN_MSG,
  RATE_LIMITED_MSG,
  GLOBAL_CAP_MSG,
  GENERIC_ERROR_MSG,
  isOptOutKeyword,
  isOptInKeyword,
  isYesKeyword,
} from '@/lib/whatsapp/messages'
import { buildReply } from '@/lib/whatsapp/handlers'
import { clearState } from '@/lib/whatsapp/state'

// ─── Signature verification ───────────────────────────────────────────────────
// WasenderAPI variants differ in header name and encoding — we try all.
function pickSignature(req: NextRequest): string | null {
  return (
    req.headers.get('x-webhook-signature') ??
    req.headers.get('x-wasender-signature') ??
    req.headers.get('webhook-signature')    ??
    req.headers.get('signature')            ??
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
  // In dev / no-secret config: allow all (never in production)
  if (!secret) return process.env.NODE_ENV !== 'production'
  if (!signature) return false

  const sig = signature.replace(/^sha256=/i, '').trim()

  // Three accepted formats: raw secret, HMAC-hex, HMAC-base64
  if (safeEqual(sig, secret)) return true
  if (safeEqual(sig, crypto.createHmac('sha256', secret).update(rawBody).digest('hex')))    return true
  if (safeEqual(sig, crypto.createHmac('sha256', secret).update(rawBody).digest('base64'))) return true

  console.warn('[wa-webhook] signature mismatch — possible spoofed request, len=', sig.length)
  return false
}

// ─── Message extraction ───────────────────────────────────────────────────────
// Handles Baileys v6/v7 format AND simple flat payloads from other adapters.
interface Parsed { from: string; text: string; msgId?: string }

function extractMessage(body: any): Parsed | null {
  if (!body) return null

  // ── Baileys-style (WasenderAPI standard) ──────────────────────
  const msg = body?.data?.messages?.[0] ?? body?.messages?.[0]
  if (msg) {
    // Drop our own outgoing messages
    if (msg?.key?.fromMe) return null

    const remoteJid: string = msg?.key?.remoteJid ?? msg?.remoteJid ?? ''

    // Drop group chats, broadcast lists, and newsletter channels
    if (
      remoteJid.includes('@g.us') ||
      remoteJid.includes('@broadcast') ||
      remoteJid.includes('@newsletter') ||
      remoteJid.includes('@lid')
    ) return null

    const phone = remoteJid.split('@')[0]?.replace(/[^\d]/g, '')
    if (!phone) return null

    const msgId: string = msg?.key?.id ?? ''

    const m = msg?.message ?? {}
    const text: string =
      m?.conversation                              ??
      m?.extendedTextMessage?.text                 ??
      m?.imageMessage?.caption                     ??
      m?.videoMessage?.caption                     ??
      m?.documentMessage?.caption                  ??
      m?.buttonsResponseMessage?.selectedDisplayText ??
      m?.listResponseMessage?.title                ??
      m?.templateButtonReplyMessage?.selectedDisplayText ??
      ''

    if (!text.trim()) return null
    return { from: phone, text: text.trim(), msgId }
  }

  // ── Flat / direct format ────────────────────────────────────────
  const directFrom = body?.from ?? body?.sender ?? body?.phone
  const directText = body?.text ?? body?.message ?? body?.body
  if (directFrom && directText) {
    return {
      from:  String(directFrom).replace(/[^\d]/g, ''),
      text:  String(directText).trim(),
      msgId: body?.id ?? body?.messageId ?? undefined,
    }
  }

  return null
}

// ─── Master message handler ───────────────────────────────────────────────────
async function handleMessage(from: string, text: string) {
  const consent = await getConsent(from)
  console.info(
    `[wa-in] from=${from.slice(0, 4)}***${from.slice(-2)} ` +
    `consent=${consent} text="${text.slice(0, 60)}"`,
  )

  // Track activity regardless of consent state
  await Promise.all([
    recordActivity(from),
    incrementInboundCount(),
  ])

  // ── 1. Opt-out always wins — process before ANY other check ──────
  if (isOptOutKeyword(text)) {
    await setConsent(from, 'opted_out')
    await clearState(from)
    await sendWhatsApp(from, OPTED_OUT_MSG(), { bypassSafety: true, immediate: true })
    return
  }

  // ── 2. Previously opted out — only START/YES re-activates ────────
  if (consent === 'opted_out') {
    if (isOptInKeyword(text) || isYesKeyword(text)) {
      await setConsent(from, 'accepted')
      await sendWhatsApp(from, OPT_IN_AGAIN_MSG(), { bypassSafety: true })
    }
    // Silently ignore everything else — never message an opted-out user
    return
  }

  // ── 3. First-time user — send TOS and wait for YES ───────────────
  if (consent === 'none') {
    await setConsent(from, 'pending')
    await sendWhatsApp(from, TOS_PROMPT_MSG(), { bypassSafety: true })
    return
  }

  // ── 4. TOS pending — must accept before anything else ────────────
  if (consent === 'pending') {
    if (isYesKeyword(text)) {
      await setConsent(from, 'accepted')
      await sendWhatsApp(from, TOS_ACCEPTED_MSG())
      return
    }
    if (isOptOutKeyword(text)) {
      await setConsent(from, 'opted_out')
      await sendWhatsApp(from, OPTED_OUT_MSG(), { bypassSafety: true, immediate: true })
      return
    }
    // Re-send the TOS reminder (polite, not spammy)
    await sendWhatsApp(from, TOS_PENDING_REMINDER_MSG(), { bypassSafety: true })
    return
  }

  // ── 5. Fully opted-in — run the full bot ─────────────────────────
  try {
    const reply = await buildReply(from, text)

    const result = await sendWhatsApp(from, reply)

    if (!result.ok) {
      if (result.reason === 'rate-limit') {
        await sendWhatsApp(from, RATE_LIMITED_MSG(), { bypassSafety: true, immediate: true })
      } else if (result.reason === 'global-cap') {
        await sendWhatsApp(from, GLOBAL_CAP_MSG(), { bypassSafety: true, immediate: true })
      }
      // opted-out / duplicate: silently drop
    }
  } catch (err: any) {
    console.error('[wa-in] handler threw:', err?.message ?? err)
    await sendWhatsApp(from, GENERIC_ERROR_MSG(), { bypassSafety: true }).catch(() => {})
  }
}

// ─── POST — incoming webhook ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const rawBody   = await req.text()
    const signature = pickSignature(req)

    if (!verifySignature(rawBody, signature)) {
      console.warn('[wa-webhook] rejected: invalid signature')
      return new NextResponse('Invalid signature', { status: 401 })
    }

    let body: any = {}
    try { body = JSON.parse(rawBody) } catch { /* not JSON — ignore */ }

    const evt = body?.event ?? body?.type ?? 'unknown'
    console.info(`[wa-webhook] event=${evt}`)

    // Dashboard test pings — just ack with 200
    if (evt === 'webhook.test' || evt === 'test') {
      return new NextResponse('OK', { status: 200 })
    }

    // Track session connectivity events
    if (
      evt === 'session.status'       ||
      evt === 'session.connected'    ||
      evt === 'session.disconnected' ||
      evt === 'connection.update'
    ) {
      const status =
        body?.data?.status ?? body?.status ?? evt.replace('session.', '').replace('connection.', '')
      console.info(`[wa-session] status=${status}`)
      await setSessionStatus(String(status)).catch(() => {})
    }

    // Extract and process message
    const parsed = extractMessage(body)

    if (!parsed) {
      console.info(
        `[wa-webhook] no message in event=${evt}; sample=`,
        JSON.stringify(body).slice(0, 300),
      )
      return new NextResponse('OK', { status: 200 })
    }

    // Idempotency: skip if this exact message ID was already processed
    if (parsed.msgId && await isAlreadyProcessed(parsed.msgId)) {
      console.info(`[wa-webhook] skipped duplicate msgId=${parsed.msgId}`)
      return new NextResponse('OK', { status: 200 })
    }

    // Fire-and-forget so we respond 200 to WasenderAPI within ~500 ms
    // (prevents WasenderAPI retrying the webhook for slow handlers)
    handleMessage(parsed.from, parsed.text).catch(err =>
      console.error('[wa-handle] unhandled error:', err?.message ?? err),
    )

    return new NextResponse('OK', { status: 200 })
  } catch (err: any) {
    console.error('[wa-webhook] top-level error:', err?.message ?? err)
    // Always return 200 to prevent WasenderAPI from retrying indefinitely
    return new NextResponse('OK', { status: 200 })
  }
}

// ─── GET — health check for admin dashboard ───────────────────────────────────
export async function GET() {
  const [session, inbound, dailySent] = await Promise.all([
    getSessionStatus().catch(() => ({ status: 'error', at: null })),
    getInboundStats().catch(() => ({ today: 0, total: 0 })),
    getGlobalDailyCount().catch(() => 0),
  ])

  return NextResponse.json({
    ok:        true,
    provider:  'wasenderapi',
    hasKey:    Boolean(process.env.WASENDER_API_KEY),
    hasSecret: Boolean(process.env.WASENDER_WEBHOOK_SECRET),
    env:       process.env.NODE_ENV,
    session,
    stats: {
      inboundToday:  inbound.today,
      inboundTotal:  inbound.total,
      outboundToday: dailySent,
      dailyCap:      800,
    },
  })
}
