import { createClient } from '@/lib/supabase/client'

export async function uploadToCloudinary(file: File): Promise<string> {
  // 1. Get the current session token
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('You must be signed in to upload photos.')
  }

  // 2. Ask our server to generate a signed upload URL
  const signRes = await fetch('/api/storage/sign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ filename: file.name, contentType: file.type }),
  })

  const signJson = await signRes.json()
  if (!signRes.ok) {
    throw new Error(signJson.error ?? 'Could not prepare upload.')
  }

  const { signedUrl, token, publicUrl } = signJson as {
    signedUrl: string
    token: string
    publicUrl: string
  }

  // 3. Upload the file directly from the browser to Supabase (no server hop)
  const uploadRes = await supabase.storage
    .from('product-images')
    .uploadToSignedUrl(signJson.path, token, file, {
      contentType: file.type,
    })

  if (uploadRes.error) {
    throw new Error(uploadRes.error.message)
  }

  // 4. Return the permanent public URL
  return publicUrl
}
