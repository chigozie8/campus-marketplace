import { createClient } from '@/lib/supabase/server'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooter } from '@/components/landing/landing-footer'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const user = supabase ? (await supabase.auth.getUser()).data.user : null

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNav user={user} />
      <main className="flex-1 pt-24">{children}</main>
      <LandingFooter />
    </div>
  )
}
