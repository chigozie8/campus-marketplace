import { NextResponse } from 'next/server'
import { createAppwriteAdminClient } from '@/lib/appwrite'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }

    const { account } = createAppwriteAdminClient()

    // Create email OTP session — Appwrite sends the code automatically
    const token = await account.createEmailToken(
      'unique()',
      email,
      false, // don't create a session yet
    )

    return NextResponse.json({ success: true, userId: token.userId })
  } catch (err: unknown) {
    console.error('[send-otp]', err)
    const message = err instanceof Error ? err.message : 'Failed to send OTP'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
