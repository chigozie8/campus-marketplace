import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { compareFaces } from '@/lib/facepp'

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: adminRole } = await adminClient
    .from('admin_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!adminRole) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: verification, error: fetchErr } = await adminClient
    .from('vendor_verifications')
    .select('id_image_url, selfie_image_url')
    .eq('id', id)
    .single()

  if (fetchErr || !verification) {
    return NextResponse.json({ error: 'Verification not found' }, { status: 404 })
  }

  const { id_image_url, selfie_image_url } = verification

  if (!id_image_url || !selfie_image_url) {
    return NextResponse.json(
      { error: 'Both an ID photo and a selfie are required for face matching.' },
      { status: 400 }
    )
  }

  const result = await compareFaces(id_image_url, selfie_image_url)

  return NextResponse.json(result)
}
