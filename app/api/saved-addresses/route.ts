import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ success: false, message: 'Auth unavailable' }, { status: 500 })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })

  const { data, error } = await supabase
    .from('saved_addresses')
    .select('id, label, address, is_default, created_at')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    if (error.message?.includes('saved_addresses')) {
      return NextResponse.json({ success: true, data: [] })
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: data ?? [] })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ success: false, message: 'Auth unavailable' }, { status: 500 })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })

  const body = await req.json().catch(() => null) as { label?: string; address?: string; is_default?: boolean } | null
  const label = body?.label?.trim() ?? ''
  const address = body?.address?.trim() ?? ''
  const isDefault = !!body?.is_default

  if (!label || label.length > 60) {
    return NextResponse.json({ success: false, message: 'Label must be 1–60 characters.' }, { status: 400 })
  }
  if (address.length < 5 || address.length > 500) {
    return NextResponse.json({ success: false, message: 'Address must be 5–500 characters.' }, { status: 400 })
  }

  if (isDefault) {
    await supabase
      .from('saved_addresses')
      .update({ is_default: false })
      .eq('user_id', user.id)
      .eq('is_default', true)
  }

  const { data, error } = await supabase
    .from('saved_addresses')
    .insert({ user_id: user.id, label, address, is_default: isDefault })
    .select('id, label, address, is_default, created_at')
    .single()

  if (error) {
    if (error.message?.includes('saved_addresses')) {
      return NextResponse.json(
        { success: false, message: 'Saved addresses table missing. Run supabase/saved_addresses.sql in the Supabase SQL editor.' },
        { status: 500 },
      )
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}
