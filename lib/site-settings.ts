import { createClient } from '@/lib/supabase/server'
import { type SiteSettings, DEFAULT_SETTINGS } from './site-settings-defaults'

export type { SiteSettings } from './site-settings-defaults'
export { DEFAULT_SETTINGS } from './site-settings-defaults'

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = await createClient()
    if (!supabase) return DEFAULT_SETTINGS
    const { data } = await supabase.from('site_settings').select('key, value')
    if (!data?.length) return DEFAULT_SETTINGS
    const map = Object.fromEntries(data.map((r: { key: string; value: string }) => [r.key, r.value]))
    return { ...DEFAULT_SETTINGS, ...map } as SiteSettings
  } catch {
    return DEFAULT_SETTINGS
  }
}
