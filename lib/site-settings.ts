import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { cachedFetch } from '@/lib/cache'
import { type SiteSettings, DEFAULT_SETTINGS } from './site-settings-defaults'

export type { SiteSettings } from './site-settings-defaults'
export { DEFAULT_SETTINGS, DEFAULT_FAQS, DEFAULT_TESTIMONIALS, DEFAULT_HIW_STEPS, parseHiwSteps, parseFaqs, parseTestimonials } from './site-settings-defaults'
export type { FaqItem, TestimonialItem, HiwStep } from './site-settings-defaults'

/**
 * Fetches site settings from Supabase with multi-layer caching:
 * 1. React cache() - deduplicates within a single request
 * 2. In-memory cache - persists across requests with stale-while-revalidate
 * 3. Falls back to DEFAULT_SETTINGS if database is unavailable
 * 
 * This ensures your site keeps working even when Supabase goes down.
 */
export const getSiteSettings = cache(async function fetchSiteSettings(): Promise<SiteSettings> {
  return cachedFetch<SiteSettings>(
    'site-settings',
    async () => {
      const supabase = await createClient()
      if (!supabase) throw new Error('Supabase client not available')
      
      const { data, error } = await supabase.from('site_settings').select('key, value')
      if (error) throw error
      if (!data?.length) return DEFAULT_SETTINGS
      
      const map = Object.fromEntries(data.map((r: { key: string; value: string }) => [r.key, r.value]))
      return { ...DEFAULT_SETTINGS, ...map } as SiteSettings
    },
    {
      staleTime: 300, // Consider stale after 5 minutes
      maxAge: 86400, // Keep in cache up to 24 hours (for disaster recovery)
      fallback: DEFAULT_SETTINGS, // Use defaults if all else fails
    }
  )
})
