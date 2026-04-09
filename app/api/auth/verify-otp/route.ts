import { NextResponse } from 'next/server'
import { Client, Account } from 'node-appwrite'

export async function POST(req: Request) {
  try {
    const { userId, otp } = await req.json()
    if (!userId || !otp) {
      return NextResponse.json({ error: 'userId and otp are required.' }, { status: 400 })
    }

    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

    const account = new Account(client)

    // Exchange the OTP for a session (this validates the code)
    const session = await account.createSession(userId, otp)

    return NextResponse.json({ success: true, sessionId: session.$id })
  } catch (err: unknown) {
    console.error('[verify-otp]', err)
    const message = err instanceof Error ? err.message : 'Invalid or expired code'
    const isInvalid =
      message.toLowerCase().includes('invalid') ||
      message.toLowerCase().includes('expired') ||
      message.toLowerCase().includes('incorrect')
    return NextResponse.json(
      { error: isInvalid ? 'Invalid or expired code. Please try again.' : message },
      { status: 400 },
    )
  }
}
