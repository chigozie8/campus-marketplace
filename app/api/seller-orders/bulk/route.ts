import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

function svc() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

type Action = 'mark_shipped' | 'cancel'

const ALLOWED_FROM: Record<Action, string[]> = {
  mark_shipped: ['paid'],
  cancel: ['pending', 'paid'],
}

const TARGET: Record<Action, string> = {
  mark_shipped: 'shipped',
  cancel: 'cancelled',
}

export async function POST(req: Request) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({})) as { ids?: string[]; action?: Action }
  const ids = Array.isArray(body.ids) ? body.ids.filter(s => typeof s === 'string') : []
  const action = body.action

  if (!ids.length) return NextResponse.json({ error: 'No order IDs provided' }, { status: 400 })
  if (ids.length > 100) return NextResponse.json({ error: 'Bulk limit is 100 orders per request' }, { status: 400 })
  if (!action || !(action in TARGET)) return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  const allowedFrom = ALLOWED_FROM[action]
  const target = TARGET[action]

  // Atomic: push ownership + status predicates into the UPDATE itself so
  // they cannot be bypassed by a status change between read and write.
  // We RETURN the updated rows to know exactly which IDs took effect.
  const { data: updated, error: updErr } = await svc()
    .from('orders')
    .update({ status: target, updated_at: new Date().toISOString() })
    .in('id', ids)
    .eq('seller_id', user.id)
    .in('status', allowedFrom)
    .select('id')

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })

  const updatedIds = new Set((updated ?? []).map(r => r.id))
  const results = ids.map(id => updatedIds.has(id)
    ? { id, ok: true as const }
    : { id, ok: false as const, reason: 'forbidden_or_wrong_status' }
  )

  return NextResponse.json({
    action,
    target,
    requested: ids.length,
    succeeded: updatedIds.size,
    failed: ids.length - updatedIds.size,
    results,
  })
}
