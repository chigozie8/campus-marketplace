import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const BUCKET = 'product-images'

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const admin = createAdmin(supabaseUrl, serviceKey)

    // Verify caller is authenticated via the Bearer token sent by the client
    const authHeader = request.headers.get('Authorization') ?? ''
    const accessToken = authHeader.replace('Bearer ', '').trim()
    if (!accessToken) {
      return NextResponse.json({ error: 'You must be signed in to upload photos.' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await admin.auth.getUser(accessToken)
    if (authError || !user) {
      return NextResponse.json({ error: 'Session expired. Please sign in again.' }, { status: 401 })
    }

    // Parse the uploaded file
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File is too large (max 10 MB)' }, { status: 400 })
    }

    // Create bucket if it doesn't exist yet
    const { data: buckets } = await admin.storage.listBuckets()
    if (!buckets?.some(b => b.name === BUCKET)) {
      const { error: bucketErr } = await admin.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: 10485760,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'],
      })
      if (bucketErr) {
        console.error('[storage] createBucket error:', bucketErr)
        return NextResponse.json({ error: bucketErr.message }, { status: 500 })
      }
    }

    // Unique path scoped to the authenticated user
    const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase()
    const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const arrayBuffer = await file.arrayBuffer()

    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, arrayBuffer, { contentType: file.type, upsert: false })

    if (uploadError) {
      console.error('[storage] upload error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data } = admin.storage.from(BUCKET).getPublicUrl(path)
    return NextResponse.json({ url: data.publicUrl })
  } catch (err) {
    console.error('[storage] unexpected error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unexpected server error' },
      { status: 500 }
    )
  }
}
