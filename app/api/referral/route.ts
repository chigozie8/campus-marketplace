import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const referralCode = generateReferralCode(user.id)

    const { data: referrals, error } = await supabase
      .from('profiles')
      .select('id, full_name, created_at')
      .eq('referred_by', referralCode)
      .order('created_at', { ascending: false })

    if (error && !error.message.includes('column') && !error.message.includes('does not exist')) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      referralCode,
      referralCount: referrals?.length ?? 0,
      referrals: referrals ?? [],
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export function generateReferralCode(userId: string): string {
  return userId.replace(/-/g, '').slice(0, 8).toUpperCase()
}
