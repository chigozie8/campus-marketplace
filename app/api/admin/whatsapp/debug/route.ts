/**
 * Admin debug endpoint — inspect or reset a WhatsApp number's bot state.
 *
 *   GET   /api/admin/whatsapp/debug?phone=2348012345678
 *           → { consent, state, profile }
 *
 *   POST  /api/admin/whatsapp/debug
 *         body: { phone: "...", action: "reset" | "test" | "opt_in" | "opt_out", text?: "..." }
 *
 * Auth: requires the x-admin-key header to equal INTERNAL_API_KEY,
 * OR the caller's profile must have role='admin'.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getConsent, setConsent, resetConsent, getSessionStatus } from '@/lib/whatsapp/consent'
import { getState, clearState } from '@/lib/whatsapp/state'
import { findProfileByPhone } from '@/lib/whatsapp/account'
import { sendWhatsApp } from '@/lib/whatsapp/wasender'
import { createClient as createServerClient } from '@/lib/supabase/server'

async function isAuthorized(req: NextRequest): Promise<boolean> {
  const key = req.headers.get('x-admin-key')
  if (key && process.env.INTERNAL_API_KEY && key === process.env.INTERNAL_API_KEY) return true
  try {
    const supa = await createServerClient()
    const { data: { user } } = await supa.auth.getUser()
    if (!user) return false
    const svc = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } },
    )
    const { data } = await svc.from('admin_roles').select('role').eq('user_id', user.id).maybeSingle()
    return Boolean(data?.role)
  } catch { return false }
}

export async function GET(req: NextRequest) {
  if (!await isAuthorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const phone = req.nextUrl.searchParams.get('phone')
  if (!phone) {
    const session = await getSessionStatus()
    return NextResponse.json({
      session,
      hint: 'Pass ?phone=2348012345678 to inspect a specific number',
      env: {
        hasApiKey:        Boolean(process.env.WASENDER_API_KEY),
        hasWebhookSecret: Boolean(process.env.WASENDER_WEBHOOK_SECRET),
        hasRedis:         Boolean(process.env.UPSTASH_REDIS_REST_URL),
      },
    })
  }

  const [consent, state, profile, session] = await Promise.all([
    getConsent(phone), getState(phone), findProfileByPhone(phone), getSessionStatus(),
  ])
  return NextResponse.json({ phone, consent, state, profile, session })
}

export async function POST(req: NextRequest) {
  if (!await isAuthorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: any = {}
  try { body = await req.json() } catch {}
  const { phone, action, text } = body
  if (!phone || !action) return NextResponse.json({ error: 'phone and action required' }, { status: 400 })

  switch (action) {
    case 'reset':
      await Promise.all([resetConsent(phone), clearState(phone)])
      return NextResponse.json({ ok: true, message: 'Consent + conversation state cleared.' })

    case 'opt_in':
      await setConsent(phone, 'accepted')
      return NextResponse.json({ ok: true, message: 'Marked as opted in.' })

    case 'opt_out':
      await setConsent(phone, 'opted_out')
      return NextResponse.json({ ok: true, message: 'Marked as opted out.' })

    case 'test': {
      const message = text || `🔔 *VendoorX test message*\nIf you can read this, your WhatsApp bot is working! ✅`
      const result  = await sendWhatsApp(phone, message, { bypassSafety: true, immediate: true })
      return NextResponse.json({ ok: result.ok, ...result })
    }
    default:
      return NextResponse.json({ error: 'unknown action' }, { status: 400 })
  }
}
