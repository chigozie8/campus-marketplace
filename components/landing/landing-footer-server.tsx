import { createClient } from '@/lib/supabase/server'
import { getSiteSettings } from '@/lib/site-settings'
import { LandingFooter } from '@/components/landing/landing-footer'
import type { SiteSettings } from '@/lib/site-settings-defaults'

interface Props {
  /** Optional pre-loaded settings — pass when the parent already fetched them
   *  (e.g. on the homepage) to avoid a duplicate read. */
  settings?: Partial<SiteSettings>
}

/**
 * Server wrapper that loads site_settings + the current session in one place
 * and forwards the data to <LandingFooter />. Use this from any server
 * component that previously rendered <LandingFooter /> with no props — it
 * keeps the admin-managed footer + login-aware newsletter consistent
 * everywhere without each page repeating the boilerplate.
 */
export async function LandingFooterServer({ settings: passed }: Props = {}) {
  const supabase = await createClient()

  const [settings, session] = await Promise.all([
    passed ? Promise.resolve(passed) : getSiteSettings(),
    supabase ? supabase.auth.getUser() : Promise.resolve({ data: { user: null } }),
  ])

  const user = session.data.user
  let firstName: string | null = null
  if (supabase && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle()
    const fullName = (profile?.full_name as string | undefined) ?? ''
    firstName = fullName.trim().split(/\s+/)[0] || null
  }

  return (
    <LandingFooter
      settings={settings}
      userEmail={user?.email ?? null}
      userFirstName={firstName}
    />
  )
}
