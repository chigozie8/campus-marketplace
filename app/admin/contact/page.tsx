import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getSiteSettings } from '@/lib/site-settings'
import { ContactEditor } from '@/components/admin/contact-editor'
import { Phone } from 'lucide-react'

export default async function AdminContactPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: admin } = await supabase
    .from('admin_roles').select('role').eq('user_id', user.id).single()
  if (!admin) redirect('/')

  const settings = await getSiteSettings()

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <Phone className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-black text-foreground tracking-tight">Contact Us</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Edit everything shown on the public{' '}
            <a href="/contact" target="_blank" className="font-mono text-xs text-primary hover:underline">
              /contact
            </a>{' '}
            page — channels, hours, office address, and the form subjects. Changes are live instantly.
          </p>
        </div>
      </div>
      <ContactEditor initialSettings={settings} />
    </div>
  )
}
