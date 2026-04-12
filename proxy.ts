import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest, NextResponse } from 'next/server'

const COMING_SOON = process.env.COMING_SOON === 'true'

const COMING_SOON_PATH = '/coming-soon'

// These paths always bypass the coming-soon lock
const BYPASS_PREFIXES = [
  '/_next',
  '/favicon',
  '/icon-',
  '/opengraph-image',
  '/twitter-image',
  '/manifest.webmanifest',
  '/robots.txt',
  '/sitemap.xml',
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // --- Coming Soon gate ---
  if (COMING_SOON) {
    const isComingSoonPage = pathname === COMING_SOON_PATH
    const isBypass = BYPASS_PREFIXES.some(p => pathname.startsWith(p))

    if (!isComingSoonPage && !isBypass) {
      return NextResponse.redirect(new URL(COMING_SOON_PATH, request.url))
    }
  }

  // --- Normal Supabase session handling ---
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
