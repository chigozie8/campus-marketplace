import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const BUCKET = 'product-images'

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const admin = createAdmin(supabaseUrl, serviceKey)

    // Verify the caller is authenticated via Bearer token
    const token = (request.headers.get('Authorization') ?? '').replace('Bearer ', '').trim()
    if (!token) {
      return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
    }
    const { data: { user }, error: authErr } = await admin.auth.getUser(token)
    if (authErr || !user) {
      return NextResponse.json({ error: 'Session expired. Please sign in again.' }, { status: 401 })
    }

    // Parse request body
    const { filename, contentType } = await request.json() as { filename: string; contentType: string }
    if (!filename || !contentType) {
      return NextResponse.json({ error: 'filename and contentType are required.' }, { status: 400 })
    }

    // Ensure bucket exists
    const { data: buckets } = await admin.storage.listBuckets()
    if (!buckets?.some(b => b.name === BUCKET)) {
      const { error: bucketErr } = await admin.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: 10485760,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'],
      })
      if (bucketErr && !bucketErr.message.includes('already exists')) {
        return NextResponse.json({ error: bucketErr.message }, { status: 500 })
      }
    }

    // Build a unique storage path
    const ext = (filename.split('.').pop() ?? 'jpg').toLowerCase()
    const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    // Create a signed upload URL (expires in 60 seconds)
    const { data: signedData, error: signErr } = await admin.storage
      .from(BUCKET)
      .createSignedUploadUrl(path)

    if (signErr || !signedData) {
      console.error('[storage/sign] error:', signErr)
      return NextResponse.json({ error: signErr?.message ?? 'Could not create upload URL.' }, { status: 500 })
    }

    // Return the signed URL + the final public URL the client should save
    const { data: publicData } = admin.storage.from(BUCKET).getPublicUrl(path)

    return NextResponse.json({
      signedUrl: signedData.signedUrl,
      token: signedData.token,
      path,
      publicUrl: publicData.publicUrl,
    })
  } catch (err) {
    console.error('[storage/sign] unexpected:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}
