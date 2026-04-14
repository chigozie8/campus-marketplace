import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(req: Request) {
  const {
    email,
    password,
    full_name,
    whatsapp_number,
    university,
    role,
    referred_by,
    is_student_verified,
  } = await req.json()

  if (!email || !password || !full_name || !role) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  const adminClient = createServiceClient()
  if (!adminClient) {
    return NextResponse.json({ error: 'Service unavailable.' }, { status: 503 })
  }

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: {
      full_name,
      whatsapp_number: whatsapp_number || null,
      university: university || null,
      role,
      referred_by: referred_by || null,
      is_student_verified: !!is_student_verified,
    },
  })

  if (error) {
    const isDupe = error.message.toLowerCase().includes('already')
    return NextResponse.json(
      { error: isDupe ? 'This email is already registered. Please sign in.' : error.message },
      { status: 400 },
    )
  }

  if (data.user) {
    await adminClient.from('profiles').upsert(
      {
        id: data.user.id,
        full_name,
        email,
        role,
        whatsapp_number: whatsapp_number || null,
        university: university || null,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY
  if (supabaseUrl && supabaseAnon) {
    const publicClient = createClient(supabaseUrl, supabaseAnon)
    await publicClient.auth.resend({ type: 'signup', email })
  }

  return NextResponse.json({ success: true })
}
