import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PricingEditor } from '@/components/admin/pricing-editor'
import { DollarSign } from 'lucide-react'

export default async function AdminPricingPage() {
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

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-lg font-black text-foreground tracking-tight">Pricing Plans</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Edit plan names, prices, features, and CTA buttons — changes appear live on the homepage.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2">
        <span className="font-bold">First time?</span>
        <span>Run <code className="bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 rounded text-xs font-mono">scripts/011_pricing.sql</code> in Supabase to create the pricing table and seed plans.</span>
      </div>

      <PricingEditor />
    </div>
  )
}
