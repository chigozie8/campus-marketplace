export type SiteSettings = {
  support_phone: string
  support_whatsapp_url: string
  social_whatsapp_url: string
  social_instagram_url: string
  social_facebook_url: string
  social_twitter_url: string
  social_tiktok_url: string
  stat_active_vendors: string
  stat_campuses: string
  stat_transactions: string
  stat_rating: string
  hero_avatar_1: string
  hero_avatar_2: string
  hero_avatar_3: string
  hero_avatar_4: string
  hero_avatar_5: string
}

export const DEFAULT_SETTINGS: SiteSettings = {
  support_phone: '07082039250',
  support_whatsapp_url: 'https://wa.me/2347082039250',
  social_whatsapp_url: 'https://wa.me/15792583013',
  social_instagram_url: 'https://instagram.com/vendoorx',
  social_facebook_url: 'https://facebook.com/vendoorx',
  social_twitter_url: 'https://twitter.com/vendoorx',
  social_tiktok_url: 'https://tiktok.com/@vendoorx',
  stat_active_vendors: '50,000+',
  stat_campuses: '120+',
  stat_transactions: '₦2B+',
  stat_rating: '4.9/5',
  hero_avatar_1: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&h=80&fit=crop&crop=faces&q=80',
  hero_avatar_2: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=80&h=80&fit=crop&crop=faces&q=80',
  hero_avatar_3: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=faces&q=80',
  hero_avatar_4: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&h=80&fit=crop&crop=faces&q=80',
  hero_avatar_5: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=80&h=80&fit=crop&crop=faces&q=80',
}
