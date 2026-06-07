import { createClient } from '@/lib/supabase/server'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooterServer } from '@/components/landing/landing-footer-server'
import type { Profile } from '@/lib/types'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const user = supabase ? (await supabase.auth.getUser()).data.user : null

  let profile: Pick<Profile, 'full_name' | 'avatar_url'> | null = null
  if (user && supabase) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single()
    profile = data ?? null
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNav user={user} profile={profile} />
      <main className="flex-1 pt-24">{children}</main>
      <LandingFooterServer />
    </div>
  )
}
