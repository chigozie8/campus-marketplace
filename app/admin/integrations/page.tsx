import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import { WhatsAppSettingsForm } from '@/components/admin/whatsapp-settings-form'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Integrations' }

const WA_KEYS = [
  'integration_wasender_api_key',
  'integration_wasender_webhook_secret',
]

export default async function IntegrationsPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: adminRole } = await supabase
    .from('admin_roles').select('role').eq('user_id', user.id).single()
  if (!adminRole) redirect('/')

  const sc = createServiceClient()
  const { data: rows } = sc
    ? await sc.from('site_settings').select('key, value').in('key', WA_KEYS)
    : { data: null }

  const saved = Object.fromEntries(
    (rows ?? []).map((r: { key: string; value: string }) => [r.key, r.value]),
  )

  const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vendoorx.ng'}/api/webhook/whatsapp`

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <h2 className="text-lg font-black text-foreground tracking-tight">Integrations</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Connect third-party services to power your platform
        </p>
      </div>

      <WhatsAppSettingsForm initialValues={saved} webhookUrl={webhookUrl} />
    </div>
  )
}
