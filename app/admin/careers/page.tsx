import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { JobListingsManager } from '@/components/admin/job-listings-manager'

export default async function AdminCareersPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: admin } = await supabase
    .from('admin_roles').select('role').eq('user_id', user.id).single()
  if (!admin) redirect('/')

  const { data: jobs } = await supabase
    .from('job_listings')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h2 className="text-lg font-black text-foreground tracking-tight">Careers</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage job listings shown on your public careers page at <span className="font-mono text-xs">/careers</span>
        </p>
      </div>
      <JobListingsManager initialJobs={jobs ?? []} />
    </div>
  )
}
