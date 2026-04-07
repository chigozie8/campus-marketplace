import { createClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'
import { type SiteSettings, DEFAULT_SETTINGS } from './site-settings-defaults'

export type { SiteSettings } from './site-settings-defaults'
export { DEFAULT_SETTINGS, DEFAULT_FAQS, DEFAULT_TESTIMONIALS, DEFAULT_HIW_STEPS, parseHiwSteps, parseFaqs, parseTestimonials } from './site-settings-defaults'
export type { FaqItem, TestimonialItem, HiwStep } from './site-settings-defaults'

async function fetchSiteSettings(): Promise<SiteSettings> {
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

export const getSiteSettings = unstable_cache(
  fetchSiteSettings,
  ['site-settings'],
  { revalidate: 60, tags: ['site-settings'] },
)
