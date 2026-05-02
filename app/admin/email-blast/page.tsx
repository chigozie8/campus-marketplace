import { createClient as createAdmin } from '@supabase/supabase-js'
import { EmailBlastTool } from '@/components/admin/email-blast-tool'

function svc() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export default async function AdminEmailBlastPage() {
  const db = svc()

  const [
    { count: totalUsers },
    { count: totalSellers },
    { count: totalBuyers },
    { count: totalWaitlist },
  ] = await Promise.all([
    db.from('profiles').select('*', { count: 'exact', head: true }),
    db.from('profiles').select('*', { count: 'exact', head: true }).eq('is_seller', true),
    db.from('profiles').select('*', { count: 'exact', head: true }).eq('is_seller', false),
    db.from('waitlist').select('*', { count: 'exact', head: true }),
  ])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-black text-foreground tracking-tight">Email Blast</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Send a targeted email to your users or waitlist via Mailtrap
        </p>
      </div>

      <EmailBlastTool
        totalUsers={totalUsers    ?? 0}
        totalSellers={totalSellers ?? 0}
        totalBuyers={totalBuyers   ?? 0}
        totalWaitlist={totalWaitlist ?? 0}
      />
    </div>
  )
}
