import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { normalizeAdminBadges } from '@/components/TrustBadge'

function svc() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

async function requireAdmin() {
  const supabase = await createClient()
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const db = svc()
  const { data } = await db.from('admin_roles').select('role').eq('user_id', user.id).single()
  return data ? user : null
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId } = await params
  const body = await req.json()

  const {
    is_flagged,
    flag_reason,
    admin_badges,
    trust_score_override,
    score_override_note,
  } = body

  const db = svc()

  const updates: Record<string, unknown> = {}

  if (typeof is_flagged === 'boolean') {
    updates.is_flagged = is_flagged
    updates.flagged_at = is_flagged ? new Date().toISOString() : null
    if (!is_flagged) updates.flag_reason = null
  }
  if (typeof flag_reason === 'string') updates.flag_reason = flag_reason || null
  if (Array.isArray(admin_badges)) {
    // Strip unknowns + enforce promo/rank mutual exclusion server-side
    updates.admin_badges = normalizeAdminBadges(admin_badges)
  }
  if (trust_score_override !== undefined) {
    updates.trust_score_override = trust_score_override === null ? null : Number(trust_score_override)
    updates.score_override_note = score_override_note ?? null
  }

  const { data, error } = await db
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select('id, full_name, is_flagged, flag_reason, flagged_at, admin_badges, trust_score_override, score_override_note')
    .single()

  if (error) {
    console.error('[trust-scores/userId] update failed:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Notify the user if they've been flagged
  if (typeof is_flagged === 'boolean' && is_flagged) {
    try {
      await db.from('notifications').insert({
        user_id: userId,
        type: 'system',
        title: 'Account Flagged',
        body: flag_reason
          ? `Your account has been flagged: ${flag_reason}. Please contact support.`
          : 'Your account has been flagged for review. Please contact support.',
        read: false,
      })
    } catch {
      // notification failure is non-fatal
    }
  }

  return NextResponse.json({ success: true, data })
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId } = await params
  const db = svc()

  const { data, error } = await db
    .from('profiles')
    .select('id, full_name, is_flagged, flag_reason, flagged_at, admin_badges, trust_score_override, score_override_note')
    .eq('id', userId)
    .single()

  if (error) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data })
}
