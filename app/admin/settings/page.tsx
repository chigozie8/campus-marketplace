import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import { AdminRolesManager } from '@/components/admin/admin-roles-manager'
import { SiteSettingsEditor } from '@/components/admin/site-settings-editor'
import { WhatsAppSettingsForm } from '@/components/admin/whatsapp-settings-form'
import { getSiteSettings } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: currentAdmin } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!currentAdmin) redirect('/')

  const isSuperAdmin = currentAdmin?.role === 'super_admin'

  // Use service role client to bypass RLS — the policy only lets each admin
  // see their own row, so the regular client would never return other admins.
  const sc = createServiceClient()
  const { data: admins } = sc
    ? await sc.from('admin_roles').select('id, user_id, email, role, created_at').order('created_at')
    : { data: null }

  const settings = await getSiteSettings()

  // Load saved WhatsApp / Gupshup credentials from the DB
  const WA_KEYS = [
    'integration_gupshup_api_key',
    'integration_gupshup_app_name',
    'integration_gupshup_phone_number',
  ]
  const sc2 = createServiceClient()
  const { data: waRows } = sc2
    ? await sc2.from('site_settings').select('key, value').in('key', WA_KEYS)
    : { data: null }
  const waValues = Object.fromEntries((waRows ?? []).map((r: { key: string; value: string }) => [r.key, r.value]))

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">

      <div>
        <h2 className="text-lg font-black text-foreground tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage admin access, social links, platform stats, and site content</p>
      </div>

      <div>
        <h3 className="text-sm font-black text-foreground mb-4">WhatsApp Integration</h3>
        <WhatsAppSettingsForm initialValues={waValues} />
      </div>

      <div>
        <h3 className="text-sm font-black text-foreground mb-4">Site Content</h3>
        <SiteSettingsEditor initialSettings={settings} />
      </div>

      <div>
        <h3 className="text-sm font-black text-foreground mb-4">Admin Team</h3>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h4 className="font-black text-sm text-foreground">Admin Roles</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isSuperAdmin ? 'As Super Admin, you can add and remove other admins.' : 'Contact a Super Admin to manage team members.'}
            </p>
          </div>
          <AdminRolesManager admins={admins ?? []} isSuperAdmin={isSuperAdmin} currentUserId={user.id} />
        </div>
      </div>
    </div>
  )
}
