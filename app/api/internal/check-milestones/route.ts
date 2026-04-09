import { NextResponse } from 'next/server'
import { checkAndNotifyBuyerMilestones, checkAndNotifySellerMilestones } from '@/lib/trust-milestones'

/**
 * Internal endpoint for triggering milestone checks from the backend Express app.
 * Protected by x-internal-key header (INTERNAL_API_KEY env var).
 * Body: { userId: string, role: 'buyer' | 'seller' | 'both' }
 */
export async function POST(req: Request) {
  const internalKey = req.headers.get('x-internal-key')
  const expectedKey = process.env.INTERNAL_API_KEY || ''

  if (!internalKey || internalKey !== expectedKey) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { userId, role } = await req.json()

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    if (role === 'seller' || role === 'both') {
      checkAndNotifySellerMilestones(userId).catch(() => {})
    }
    if (role === 'buyer' || role === 'both') {
      checkAndNotifyBuyerMilestones(userId).catch(() => {})
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
