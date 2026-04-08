import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function assertSuperAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()
  return data?.role === 'super_admin' ? user : null
}

// POST — grant admin role to an existing user by email
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const admin = await assertSuperAdmin(supabase)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { email, role } = await req.json()
  if (!email || !role) return NextResponse.json({ error: 'Email and role are required' }, { status: 400 })

  const sc = serviceClient()

  // Look up the user by email in auth.users using the service role
  const { data: { users }, error: listError } = await sc.auth.admin.listUsers({ perPage: 1000 })
  if (listError) return NextResponse.json({ error: 'Failed to look up users' }, { status: 500 })

  const matchedUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

  if (!matchedUser) {
    return NextResponse.json({
      error: `No account found for ${email}. The user must sign up first before being granted admin access.`
    }, { status: 404 })
  }

  // Upsert using real user_id — email unique constraint ensures no duplicates
  const { error } = await sc
    .from('admin_roles')
    .upsert(
      { user_id: matchedUser.id, email: matchedUser.email!, role },
      { onConflict: 'user_id' }
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ message: `${email} has been granted ${role} access.` })
}

// DELETE — revoke admin role
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const admin = await assertSuperAdmin(supabase)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await req.json()
  const sc = serviceClient()
  const { error } = await sc.from('admin_roles').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
