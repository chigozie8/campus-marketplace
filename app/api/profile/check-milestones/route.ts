import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAndNotifyBuyerMilestones, checkAndNotifySellerMilestones } from '@/lib/trust-milestones'

export async function POST() {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_seller')
      .eq('id', user.id)
      .maybeSingle()

    await Promise.all([
      profile?.is_seller === true ? checkAndNotifySellerMilestones(user.id) : Promise.resolve(),
      checkAndNotifyBuyerMilestones(user.id),
    ])

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
