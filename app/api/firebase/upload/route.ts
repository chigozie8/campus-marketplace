import { NextResponse } from 'next/server'
import { getFirebaseAdmin } from '@/lib/firebase-admin'
import { createClient as createServerClient } from '@/lib/supabase/server'

const BUCKET_NAME = 'store-images'
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]

export async function POST(req: Request) {
  try {
    // Verify authentication
    const serverClient = await createServerClient()
    if (!serverClient) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user } } = await serverClient.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to upload images.' },
        { status: 401 },
      )
    }

    // Get Firebase admin
    const admin = getFirebaseAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: 'Storage service unavailable' },
        { status: 503 },
      )
    }

    const form = await req.formData()
    const file = form.get('file') as File | null
    const type = form.get('type') as string | null // 'store', 'product', 'profile'

    if (!file || !file.size) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 })
    }

    const mimeType = file.type || 'application/octet-stream'
    if (!ALLOWED_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: `Unsupported file type. Allowed: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 },
      )
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum is 5 MB.` },
        { status: 400 },
      )
    }

    // Generate unique filename
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const cleanExt = ext.replace(/[^a-z0-9]/g, '')
    const filename = `${type || 'upload'}-${Date.now()}-${Math.random().toString(36).slice(2)}.${cleanExt}`
    const filepath = `${user.id}/${filename}`

    // Upload to Firebase Storage
    const bucket = admin.storage().bucket()
    const file_ref = bucket.file(filepath)

    await file_ref.save(await file.arrayBuffer(), {
      metadata: {
        contentType: mimeType,
      },
    })

    // Make file public
    await file_ref.makePublic()

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filepath}`

    return NextResponse.json({ 
      success: true,
      url: publicUrl,
      filename,
      path: filepath,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unexpected server error'
    console.error('[firebase/upload] error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
