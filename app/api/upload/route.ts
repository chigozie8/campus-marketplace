import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const BUCKET = 'product-images'

async function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env vars not configured on the server.')
  return createClient(url, key, { auth: { persistSession: false } })
}

async function ensureBucket(admin: Awaited<ReturnType<typeof getAdminClient>>) {
  const { data: list } = await admin.storage.listBuckets()
  if (!list?.find(b => b.name === BUCKET)) {
    await admin.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 52428800,
    })
  }
}

const ALLOWED_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/webm', 'video/quicktime',
]

export async function POST(req: Request) {
  try {
    const admin = await getAdminClient()
    await ensureBucket(admin)

    const form = await req.formData()
    const file = form.get('file') as File | null

    if (!file || !file.size) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 })
    }

    const isVideo = file.type.startsWith('video/')
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum is ${isVideo ? '50 MB' : '10 MB'}.` },
        { status: 400 },
      )
    }

    const mimeType = file.type || 'application/octet-stream'
    if (!ALLOWED_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${mimeType}` },
        { status: 400 },
      )
    }

    const rawExt = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
    const ext    = rawExt.replace(/[^a-z0-9]/g, '') || 'bin'
    const name   = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const path   = `uploads/${name}`

    const { error: upErr } = await admin.storage
      .from(BUCKET)
      .upload(path, file, {
        contentType: mimeType,
        upsert: false,
      })

    if (upErr) {
      console.error('[upload] Supabase storage error:', upErr)
      return NextResponse.json(
        { error: `Storage error: ${upErr.message}` },
        { status: 500 },
      )
    }

    const { data } = admin.storage.from(BUCKET).getPublicUrl(path)
    return NextResponse.json({ url: data.publicUrl })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unexpected server error'
    console.error('[upload] Unhandled error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
