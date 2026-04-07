import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BoostSettingsEditor } from '@/components/admin/boost-settings-editor'
import { Zap } from 'lucide-react'

export const metadata = { title: 'Boost Pricing' }

const BOOST_KEYS = [
  'boost_listing_price_kobo',
  'boost_store_price_kobo',
  'boost_duration_days',
]

export default async function AdminBoostPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: adminRole } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!adminRole) redirect('/auth/login')

  const { data: rows } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', BOOST_KEYS)

  const settings: Record<string, string> = {}
  for (const r of rows ?? []) settings[r.key] = r.value

  const listingNaira = Math.round(parseInt(settings['boost_listing_price_kobo'] ?? '150000', 10) / 100)
  const storeNaira   = Math.round(parseInt(settings['boost_store_price_kobo']   ?? '250000', 10) / 100)
  const duration     = parseInt(settings['boost_duration_days'] ?? '7', 10)

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-lg font-black text-foreground tracking-tight">Boost Pricing</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Control how much sellers pay to boost a listing or their entire store.
            Changes apply immediately to new boost purchases.
          </p>
        </div>
      </div>

      {/* Current prices summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border bg-card p-4 text-center">
          <p className="text-2xl font-black text-primary">₦{listingNaira.toLocaleString('en-NG')}</p>
          <p className="text-xs text-muted-foreground mt-1">Listing Boost</p>
        </div>
        <div className="rounded-2xl border bg-card p-4 text-center">
          <p className="text-2xl font-black text-primary">₦{storeNaira.toLocaleString('en-NG')}</p>
          <p className="text-xs text-muted-foreground mt-1">Store Boost</p>
        </div>
        <div className="rounded-2xl border bg-card p-4 text-center">
          <p className="text-2xl font-black text-primary">{duration}d</p>
          <p className="text-xs text-muted-foreground mt-1">Duration</p>
        </div>
      </div>

      {/* Editor */}
      <div className="rounded-2xl border bg-card p-6">
        <h3 className="font-bold text-foreground mb-5">Edit Boost Pricing</h3>
        <BoostSettingsEditor initialSettings={settings} />
      </div>
    </div>
  )
}
