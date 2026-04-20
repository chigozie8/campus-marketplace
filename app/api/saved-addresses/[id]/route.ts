import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ success: false, message: 'Auth unavailable' }, { status: 500 })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })

  const body = await req.json().catch(() => null) as { is_default?: boolean; label?: string; address?: string } | null
  if (!body) return NextResponse.json({ success: false, message: 'Invalid body' }, { status: 400 })

  if (body.is_default === true) {
    await supabase
      .from('saved_addresses')
      .update({ is_default: false })
      .eq('user_id', user.id)
      .eq('is_default', true)
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (typeof body.is_default === 'boolean') updates.is_default = body.is_default
  if (typeof body.label === 'string') updates.label = body.label.trim()
  if (typeof body.address === 'string') updates.address = body.address.trim()

  const { data, error } = await supabase
    .from('saved_addresses')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id, label, address, is_default, created_at')
    .single()

  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ success: false, message: 'Auth unavailable' }, { status: 500 })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })

  const { error } = await supabase
    .from('saved_addresses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
