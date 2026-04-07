import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BADGES = [
  { id: 'starter',  label: 'Starter',  emoji: '🌱', threshold: 1  },
  { id: 'pro',      label: 'Pro',      emoji: '⚡', threshold: 5  },
  { id: 'champion', label: 'Champion', emoji: '🏆', threshold: 10 },
  { id: 'legend',   label: 'Legend',   emoji: '👑', threshold: 25 },
]

export function generateReferralCode(userId: string): string {
  return userId.replace(/-/g, '').slice(0, 8).toUpperCase()
}

export async function GET() {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const referralCode = generateReferralCode(user.id)

    // Get referral_count from profile (updated by DB function on order completion)
    const { data: profile } = await supabase
      .from('profiles')
      .select('referral_count')
      .eq('id', user.id)
      .single()

    const referralCount = profile?.referral_count ?? 0

    // Get recent referrals list
    const { data: referrals, error } = await supabase
      .from('profiles')
      .select('id, full_name, created_at')
      .eq('referred_by', referralCode)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Compute earned badges and next milestone
    const earnedBadges = BADGES.filter(b => referralCount >= b.threshold)
    const currentBadge = earnedBadges[earnedBadges.length - 1] ?? null
    const nextBadge = BADGES.find(b => referralCount < b.threshold) ?? null

    return NextResponse.json({
      referralCode,
      referralCount,
      referrals: referrals ?? [],
      currentBadge,
      nextBadge,
      badges: BADGES,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
