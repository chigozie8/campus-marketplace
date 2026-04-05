import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminRolesManager } from '@/components/admin/admin-roles-manager'

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const { data: { user } } = await supabase.auth.getUser()
  const { data: currentAdmin } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', user!.id)
    .single()

  const isSuperAdmin = currentAdmin?.role === 'super_admin'

  const { data: admins } = await supabase
    .from('admin_roles')
    .select('id, user_id, email, role, created_at')
    .order('created_at')

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-black text-foreground tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage admin access and roles</p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-black text-sm text-foreground">Admin Team</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isSuperAdmin ? 'As Super Admin, you can add and remove other admins.' : 'Contact a Super Admin to manage team members.'}
          </p>
        </div>
        <AdminRolesManager admins={admins ?? []} isSuperAdmin={isSuperAdmin} currentUserId={user!.id} />
      </div>
    </div>
  )
}
