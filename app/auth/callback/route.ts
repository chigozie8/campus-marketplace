import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'
  
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get the origin from the request URL (works in production)
      const origin = requestUrl.origin
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return to login with error if something went wrong
  const origin = requestUrl.origin
  return NextResponse.redirect(`${origin}/auth/login?error=Could not authenticate user`)
}
