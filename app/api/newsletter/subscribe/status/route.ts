import { NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { createClient as createServerSupabase } from '@/lib/supabase/server'

function db() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

/**
 * GET /api/newsletter/subscribe/status
 * Returns whether the currently logged-in user is on the active newsletter
 * list. Used by <NewsletterForm/> to show a disabled "Already subscribed"
 * state instead of letting them spam the subscribe button.
 *
 * Always returns 200 so the form has a clean, predictable response shape:
 *   { subscribed: boolean }
 * For guests / unconfigured envs, `subscribed` is false.
 */
export async function GET() {
  try {
    const supabase = await createServerSupabase()
    if (!supabase) return NextResponse.json({ subscribed: false })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return NextResponse.json({ subscribed: false })

    const email = user.email.trim().toLowerCase()
    const admin = db()
    const { data, error } = await admin
      .from('newsletter_subscribers')
      .select('id, unsubscribed')
      .eq('email', email)
      .maybeSingle()

    if (error) {
      console.error('[newsletter/status]', error)
      return NextResponse.json({ subscribed: false })
    }

    const subscribed = !!data && !data.unsubscribed
    return NextResponse.json({ subscribed })
  } catch (err) {
    console.error('[newsletter/status]', err)
    return NextResponse.json({ subscribed: false })
  }
}
