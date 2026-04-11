import { NextRequest, NextResponse } from 'next/server'

// In production (Vercel), BACKEND_URL points to the Railway backend.
// In development (Replit), fall back to localhost:3001.
const BACKEND_INTERNAL = process.env.BACKEND_URL ?? 'http://localhost:3001'

async function proxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const pathStr = path.join('/')

  const { search } = new URL(req.url)
  const target = `${BACKEND_INTERNAL}/api/${pathStr}${search}`

  const headers = new Headers()
  const auth = req.headers.get('authorization')
  if (auth) headers.set('authorization', auth)

  const contentType = req.headers.get('content-type')
  if (contentType) headers.set('content-type', contentType)

  let body: BodyInit | null = null
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = await req.text()
  }

  let upstream: Response
  try {
    upstream = await fetch(target, {
      method: req.method,
      headers,
      body: body || undefined,
    })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Backend service unavailable' },
      { status: 503 },
    )
  }

  const responseBody = await upstream.text()

  return new NextResponse(responseBody, {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') || 'application/json',
    },
  })
}

export const GET    = proxy
export const POST   = proxy
export const PATCH  = proxy
export const PUT    = proxy
export const DELETE = proxy
