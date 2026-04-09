import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function DELETE() {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userId = user.id

    // 1. Anonymise the profile (keep row for relational integrity, remove PII)
    await adminDb.from('profiles').update({
      full_name: '[Deleted User]',
      phone: null,
      avatar_url: null,
      bio: null,
      location: null,
      university: null,
      instagram: null,
      twitter: null,
      whatsapp: null,
      updated_at: new Date().toISOString(),
    }).eq('id', userId)

    // 2. Soft-cancel all pending orders by this buyer
    await adminDb
      .from('orders')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('buyer_id', userId)
      .in('status', ['pending', 'paid'])

    // 3. Mark all their product listings as inactive
    await adminDb
      .from('products')
      .update({ status: 'inactive' })
      .eq('seller_id', userId)

    // 4. Remove push subscriptions
    await adminDb.from('push_subscriptions').delete().eq('user_id', userId)

    // 5. Delete the auth user (this is irreversible)
    const { error: deleteErr } = await adminDb.auth.admin.deleteUser(userId)
    if (deleteErr) {
      console.error('[account/delete] auth delete failed:', deleteErr.message)
      return NextResponse.json({ error: 'Failed to delete account. Please contact support.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[account/delete]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
