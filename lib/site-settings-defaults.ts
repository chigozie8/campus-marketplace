export type PressAsset = {
  name: string
  desc: string
  size: string
  url: string
}

export type SiteSettings = {
  /* ── Press Kit ── */
  press_company_description: string
  press_founder_name: string
  press_founder_title: string
  press_founder_initials: string
  press_founder_photo: string
  press_founder_bio: string
  press_founder_bio2: string
  press_founder_quote: string
  press_contact_email: string
  press_assets: string
  /* ── Platform Fee ── */
  platform_fee_amount: string
  platform_fee_label: string
  /* ── Contact & Support ── */
  support_phone: string
  support_whatsapp_url: string
  contact_email: string
  contact_hero_subtitle: string
  contact_response_time: string
  contact_hours: string
  contact_office_name: string
  contact_office_address: string
  contact_subjects: string
  /* ── Social URLs ── */
  social_whatsapp_url: string
  social_instagram_url: string
  social_facebook_url: string
  social_twitter_url: string
  social_tiktok_url: string
  /* ── Platform Stats ── */
  stat_active_vendors: string
  stat_active_vendors_sub: string
  stat_campuses: string
  stat_campuses_sub: string
  stat_transactions: string
  stat_transactions_sub: string
  stat_rating: string
  stat_rating_sub: string
  /* ── Hero Avatars ── */
  hero_avatar_1: string
  hero_avatar_2: string
  hero_avatar_3: string
  hero_avatar_4: string
  hero_avatar_5: string
  /* ── Hero Text ── */
  hero_badge: string
  hero_line1: string
  hero_accent: string
  hero_subtitle: string
  hero_cta_primary: string
  hero_cta_secondary: string
  /* ── How It Works ── */
  hiw_title: string
  hiw_subtitle: string
  /* ── JSON arrays (stored as JSON strings) ── */
  homepage_hiw_steps: string
  homepage_faqs: string
  homepage_testimonials: string
  homepage_hero_features: string
  homepage_escrow_steps: string
  homepage_sections_visible: string
  homepage_trending_enabled: string
  /* ── Help Center ── */
  help_hero_title: string
  help_hero_subtitle: string
  help_search_placeholder: string
  help_categories: string
  help_popular: string
  help_contact_title: string
  help_contact_subtitle: string
  help_contact_phone: string
  help_contact_whatsapp_url: string
  help_contact_email: string
}

/* ── Typed shapes for JSON array fields ── */
export type HiwStep = {
  step: string
  title: string
  description: string
}

export type FaqItem = {
  category: string
  q: string
  a: string
}

export type TestimonialItem = {
  name: string
  role: string
  school: string
  avatar: string
  initials: string
  metric: string
  metricLabel: string
  quote: string
  verified: boolean
  accent: string
}

/* ── Defaults for JSON arrays ── */
export const DEFAULT_HIW_STEPS: HiwStep[] = [
  {
    step: '01',
    title: 'Create your free account',
    description: 'Sign up in seconds with your email. Complete your seller profile with your campus, WhatsApp number, and what you sell.',
  },
  {
    step: '02',
    title: 'List your products',
    description: 'Upload photos, write a description, set your price, and choose your category. Your listing goes live instantly.',
  },
  {
    step: '03',
    title: 'Share across platforms',
    description: 'Share your listings to WhatsApp Status, Instagram Stories, and Facebook with one click.',
  },
  {
    step: '04',
    title: 'Close deals on WhatsApp',
    description: 'Buyers tap "Chat on WhatsApp" and land directly in your DMs. Negotiate, confirm, and get paid — no platform interference.',
  },
]

export const DEFAULT_FAQS: FaqItem[] = [
  { category: 'Getting Started', q: 'Is VendoorX completely free to join?', a: 'Yes — joining VendoorX is 100% free. The Starter plan lets you list up to 10 products, generate WhatsApp order links, and receive buyers at zero cost, forever. We only charge if you choose to upgrade to a paid plan for advanced features.' },
  { category: 'Getting Started', q: 'Do I need a website to use VendoorX?', a: 'Not at all. VendoorX gives you a ready-made public store profile page you can share with anyone. No coding, no hosting, no setup — just sign up, add your products, and your store is live within minutes.' },
  { category: 'Payments', q: 'How do payments work on VendoorX?', a: 'On the free Starter plan, payments are handled directly between you and your buyer — cash on campus, bank transfer, etc. On Growth and Pro plans, you get Paystack integration so buyers can pay directly and you receive automatic payment confirmations.' },
  { category: 'Payments', q: 'Does VendoorX charge commission on my sales?', a: 'Never. VendoorX charges zero commission on any sale you make, regardless of your plan. The subscription fee is all you pay — keep every naira you earn.' },
  { category: 'Platform', q: 'What platforms does VendoorX work with?', a: 'VendoorX is built around WhatsApp, Instagram, and Facebook. You can share your listings and store directly to WhatsApp Status, Instagram Stories, and Facebook with a single tap.' },
  { category: 'Platform', q: 'How does the Verified Seller badge work?', a: 'The Verified Seller badge is available on the Pro plan. Our team reviews your profile, products, and history before granting verification. Verified sellers consistently convert more buyers because the badge signals trust and legitimacy.' },
  { category: 'Platform', q: 'Is VendoorX only for university students in Nigeria?', a: 'VendoorX is focused on Nigerian campuses and university students, but anyone can use the platform. We currently serve 120+ campuses across Nigeria including UNILAG, UI, OAU, FUTA, ABU, and BUK.' },
  { category: 'Billing', q: 'Can I cancel my subscription anytime?', a: 'Yes. You can upgrade, downgrade, or cancel your subscription at any time from your dashboard settings. When you cancel, you keep access until the end of your billing period, then you revert to the free Starter plan.' },
  { category: 'Platform', q: 'What is the AI listing assistant?', a: 'The AI listing assistant (available on the Pro plan) helps you write better product titles, descriptions, and pricing recommendations. It analyses successful listings in your category and suggests copy that attracts more buyers and converts faster.' },
  { category: 'Getting Started', q: 'How do I get started?', a: 'Click "Get Started Free" anywhere on this page. Sign up with your email or Google account, create your store profile, and add your first product. The whole setup takes under 5 minutes — no credit card needed.' },
]

export const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  { name: 'Adaeze Okonkwo', role: 'Fashion Seller', school: 'UNILAG', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=120&h=120&fit=crop&crop=faces&q=80', initials: 'AO', metric: '₦180K', metricLabel: 'first month', quote: 'I made ₦180,000 in my first month selling clothes on VendoorX. The WhatsApp button is genius — buyers just chat me directly and we close the deal in minutes.', verified: true, accent: '#16a34a' },
  { name: 'Chukwuemeka Eze', role: 'Electronics Reseller', school: 'UI Ibadan', avatar: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=120&h=120&fit=crop&crop=faces&q=80', initials: 'CE', metric: '3 Laptops', metricLabel: 'one week', quote: 'Sold 3 laptops in one week just from listing them here. The platform is clean, fast, and the seller dashboard shows me exactly how many people viewed my listings.', verified: true, accent: '#2563eb' },
  { name: 'Fatimah Al-Hassan', role: 'Food Vendor', school: 'ABU Zaria', avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=120&h=120&fit=crop&crop=faces&q=80', initials: 'FA', metric: 'Daily Orders', metricLabel: 'campus-wide', quote: 'My jollof rice business blew up after I listed on VendoorX. I get daily orders from students across campus. Best business decision I ever made.', verified: true, accent: '#ea580c' },
  { name: 'Oluwafemi Adeyemi', role: 'Textbook Seller', school: 'OAU', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop&crop=faces&q=80', initials: 'OA', metric: 'School Fees', metricLabel: 'recouped', quote: 'Made back my school fees selling used textbooks! Students are always looking for affordable books and VendoorX puts me right in front of them.', verified: false, accent: '#7c3aed' },
  { name: 'Blessing Nwosu', role: 'Beauty Entrepreneur', school: 'FUTA', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&crop=faces&q=80', initials: 'BN', metric: '3× Sales', metricLabel: 'after badge', quote: 'The verified seller badge gives buyers confidence. My sales tripled once I got verified. VendoorX is the real deal for serious campus entrepreneurs.', verified: true, accent: '#db2777' },
  { name: 'Ibrahim Musa', role: 'Tech Repair Service', school: 'BUK', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=faces&q=80', initials: 'IM', metric: '50+ Repairs', metricLabel: 'per month', quote: 'Running a phone repair business from my hostel room was hard until VendoorX. Now I get consistent bookings daily from students across the campus.', verified: true, accent: '#0891b2' },
]

export const DEFAULT_PRESS_ASSETS: PressAsset[] = [
  { name: 'VendoorX Logo (SVG)', desc: 'Full colour, dark & light variants', size: 'SVG', url: '' },
  { name: 'VendoorX Logo (PNG)', desc: '512×512px, transparent background', size: '128 KB', url: '' },
  { name: 'Brand Guidelines', desc: 'Colour palette, typography, usage rules', size: 'PDF', url: '' },
  { name: 'Founder Photo', desc: 'High-resolution headshot', size: '2.4 MB', url: '' },
  { name: 'Product Screenshots', desc: 'Marketplace, dashboard, and store pages', size: 'ZIP', url: '' },
]

export function parsePressAssets(raw: string): PressAsset[] {
  if (!raw) return DEFAULT_PRESS_ASSETS
  try { return JSON.parse(raw) as PressAsset[] } catch { return DEFAULT_PRESS_ASSETS }
}

export const DEFAULT_SETTINGS: SiteSettings = {
  /* press */
  press_company_description: "VendoorX is Nigeria's #1 campus marketplace, connecting students across 120+ universities to buy and sell everything from electronics and textbooks to food and services — all powered by WhatsApp and Paystack.",
  press_founder_name: 'Kenneth Okoronkwo',
  press_founder_title: 'Founder & CEO',
  press_founder_initials: 'KO',
  press_founder_photo: '',
  press_founder_bio: 'Kenneth Okoronkwo is the founder and CEO of VendoorX, Nigeria\'s leading campus commerce platform. A serial entrepreneur and software engineer, Kenneth built VendoorX to solve the informal, unstructured nature of campus trade in Nigeria.',
  press_founder_bio2: 'Under his leadership, VendoorX has grown to serve 50,000+ vendors across 120+ Nigerian universities, processing over ₦2 billion in verified transactions.',
  press_founder_quote: 'Every Nigerian campus has thousands of students with products to sell and zero tools to do it professionally. VendoorX changes that — one campus at a time.',
  press_contact_email: 'press@vendoorx.ng',
  press_assets: '',
  /* platform fee */
  platform_fee_amount: '100',
  platform_fee_label: 'VAT & Service Fee',
  /* contact */
  support_phone: '07082039150',
  support_whatsapp_url: 'https://wa.me/2347082039250',
  contact_email: 'support@vendoorx.ng',
  contact_hero_subtitle: "Got a question, bug report, or partnership idea? We're all ears. Our team usually responds within 2 hours.",
  contact_response_time: '2 hours',
  contact_hours: 'Mon – Sat: 8am – 10pm WAT\nSunday: 10am – 6pm WAT',
  contact_office_name: 'VendoorX Technologies Ltd',
  contact_office_address: 'Victoria Island, Lagos\nLagos State, Nigeria',
  contact_subjects: JSON.stringify([
    'General Enquiry',
    'Account Issue',
    'Payment Problem',
    'Report a Seller',
    'Bug Report',
    'Partnership / Press',
    'Other',
  ]),
  /* social */
  social_whatsapp_url: 'https://wa.me/15792583013',
  social_instagram_url: 'https://instagram.com/vendoorx',
  social_facebook_url: 'https://facebook.com/vendoorx',
  social_twitter_url: 'https://twitter.com/vendoorx',
  social_tiktok_url: 'https://tiktok.com/@vendoorx',
  /* stats */
  stat_active_vendors: '50,000+',
  stat_active_vendors_sub: 'Selling right now',
  stat_campuses: '120+',
  stat_campuses_sub: 'From UNILAG to BUK',
  stat_transactions: '₦2B+',
  stat_transactions_sub: 'And growing daily',
  stat_rating: '4.9/5',
  stat_rating_sub: 'From 12,500+ reviews',
  /* avatars */
  hero_avatar_1: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&h=80&fit=crop&crop=faces&q=80',
  hero_avatar_2: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=80&h=80&fit=crop&crop=faces&q=80',
  hero_avatar_3: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=faces&q=80',
  hero_avatar_4: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&h=80&fit=crop&crop=faces&q=80',
  hero_avatar_5: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=80&h=80&fit=crop&crop=faces&q=80',
  /* hero text */
  hero_badge: 'The Shopify for WhatsApp & Social Sellers in Africa',
  hero_line1: 'Sell smarter on',
  hero_accent: 'WhatsApp.',
  hero_subtitle: 'Buy and sell with classmates from {campuses} and 100+ more universities — all powered by WhatsApp. Faster than DMs. Safer than meetups. Free to start.',
  hero_cta_primary: 'Get Started Free',
  hero_cta_secondary: 'See How It Works',
  /* how it works */
  hiw_title: 'Selling made ridiculously simple',
  hiw_subtitle: 'From sign-up to first sale in under 5 minutes. No technical skills required.',
  /* JSON arrays */
  homepage_hiw_steps: '',
  homepage_faqs: '',
  homepage_testimonials: '',
  homepage_hero_features: '',
  homepage_escrow_steps: '',
  homepage_sections_visible: '',
  homepage_trending_enabled: '1',
  /* help center */
  help_hero_title: 'How can we help?',
  help_hero_subtitle: 'Find answers to common questions about buying, selling, payments, and your account.',
  help_search_placeholder: 'Search for help…',
  help_categories: '',
  help_popular: '',
  help_contact_title: 'Still need help?',
  help_contact_subtitle: 'Our Nigerian support team is available Mon–Sat 8am–10pm WAT. We typically respond within 2 hours.',
  help_contact_phone: '07082039250',
  help_contact_whatsapp_url: 'https://wa.me/2347082039250?text=Hi%20VendoorX%20Support%2C%20I%20need%20help%20with...',
  help_contact_email: 'support@vendoorx.ng',
}

/* ── Helpers ── */
export function parseHiwSteps(raw: string): HiwStep[] {
  if (!raw) return DEFAULT_HIW_STEPS
  try { return JSON.parse(raw) as HiwStep[] } catch { return DEFAULT_HIW_STEPS }
}

export function parseFaqs(raw: string): FaqItem[] {
  if (!raw) return DEFAULT_FAQS
  try { return JSON.parse(raw) as FaqItem[] } catch { return DEFAULT_FAQS }
}

export function parseTestimonials(raw: string): TestimonialItem[] {
  if (!raw) return DEFAULT_TESTIMONIALS
  try { return JSON.parse(raw) as TestimonialItem[] } catch { return DEFAULT_TESTIMONIALS }
}

/* ── Hero Feature Pills ── */
export type HeroFeature = { icon: string; text: string }
export const DEFAULT_HERO_FEATURES: HeroFeature[] = [
  { icon: 'GraduationCap', text: '120+ Nigerian Universities' },
  { icon: 'Shield',         text: 'Verified Student Sellers' },
  { icon: 'Zap',            text: 'WhatsApp-Powered Orders' },
]
export function parseHeroFeatures(raw: string): HeroFeature[] {
  if (!raw) return DEFAULT_HERO_FEATURES
  try {
    const v = JSON.parse(raw)
    return Array.isArray(v) && v.length ? (v as HeroFeature[]) : DEFAULT_HERO_FEATURES
  } catch { return DEFAULT_HERO_FEATURES }
}

/* ── Escrow Flow Steps ── */
export type EscrowStep = { title: string; description: string }
export const DEFAULT_ESCROW_STEPS: EscrowStep[] = [
  { title: 'You pay securely',  description: 'Buyer checks out via Paystack — debit card, transfer, or USSD. Funds clear in seconds.' },
  { title: 'We hold the money', description: "VendoorX holds the payment in escrow. The seller can see it, but can't touch it yet." },
  { title: 'Seller delivers',   description: 'Seller ships or hands over the item. You get a tracking update at every step.' },
  { title: 'Money releases',    description: "Once you confirm delivery (or 24 h pass with no dispute), funds release to the seller's wallet." },
]
export function parseEscrowSteps(raw: string): EscrowStep[] {
  if (!raw) return DEFAULT_ESCROW_STEPS
  try {
    const v = JSON.parse(raw)
    return Array.isArray(v) && v.length ? (v as EscrowStep[]) : DEFAULT_ESCROW_STEPS
  } catch { return DEFAULT_ESCROW_STEPS }
}

/* ── Section Visibility ── */
export type SectionVisibility = {
  trustedBy: boolean
  problemSolution: boolean
  whatsappMockup: boolean
  howItWorks: boolean
  features: boolean
  integrations: boolean
  trust: boolean
  escrow: boolean
  faq: boolean
  cta: boolean
  trending: boolean
}
export const DEFAULT_SECTION_VISIBILITY: SectionVisibility = {
  trustedBy: true,
  problemSolution: true,
  whatsappMockup: true,
  howItWorks: true,
  features: true,
  integrations: true,
  trust: true,
  escrow: true,
  faq: true,
  cta: true,
  trending: true,
}
export function parseSectionVisibility(raw: string): SectionVisibility {
  if (!raw) return DEFAULT_SECTION_VISIBILITY
  try {
    const v = JSON.parse(raw)
    return { ...DEFAULT_SECTION_VISIBILITY, ...(v as Partial<SectionVisibility>) }
  } catch { return DEFAULT_SECTION_VISIBILITY }
}

const DEFAULT_CONTACT_SUBJECTS = [
  'General Enquiry', 'Account Issue', 'Payment Problem',
  'Report a Seller', 'Bug Report', 'Partnership / Press', 'Other',
]

export function parseContactSubjects(raw: string): string[] {
  if (!raw) return DEFAULT_CONTACT_SUBJECTS
  try { return JSON.parse(raw) as string[] } catch { return DEFAULT_CONTACT_SUBJECTS }
}

/* ── Help Center ── */
export type HelpQuestion = { q: string; a: string }
export type HelpCategory = {
  title: string
  icon: 'shopping' | 'package' | 'card' | 'shield' | 'star' | 'message' | 'chat'
  color: 'blue' | 'green' | 'purple' | 'orange' | 'rose' | 'amber' | 'cyan'
  questions: HelpQuestion[]
}

export const DEFAULT_HELP_CATEGORIES: HelpCategory[] = [
  {
    title: 'Buying & Browsing',
    icon: 'shopping',
    color: 'blue',
    questions: [
      { q: 'How do I find products on VendoorX?', a: 'Use the search bar at the top of the marketplace page. You can filter by category, price range, city, and condition. The "Nearest" filter shows listings closest to your current location.' },
      { q: 'How do I contact a seller?', a: 'Click the "Chat on WhatsApp" button on any listing. This opens WhatsApp with a pre-filled message to the seller. You can also make an offer directly on the listing page.' },
      { q: 'Is it safe to buy on VendoorX?', a: 'Yes! All sellers are verified with email addresses. For checkout payments, funds are held in escrow and only released when you confirm delivery. Always check seller ratings before buying.' },
      { q: 'What if a product is not as described?', a: 'You have 24 hours after delivery to raise a dispute. Go to your order, click "Report a Problem," and our team will mediate. If the dispute is valid, you receive a full refund.' },
    ],
  },
  {
    title: 'Selling & Listings',
    icon: 'package',
    color: 'green',
    questions: [
      { q: 'How do I post a listing?', a: 'Click "Sell" in the navigation. Fill in your product name, description, price, category, and up to 5 photos or videos. Your listing goes live instantly after submission.' },
      { q: 'Is it free to list products?', a: 'Yes — listing is 100% free forever. VendoorX only charges a flat ₦100 VAT when a buyer completes a Paystack checkout (not on WhatsApp deals).' },
      { q: 'How do I boost my listing?', a: 'From your dashboard, click "Boost" next to any listing. Pay ₦500–₦2,000 via Paystack for 7 days of priority placement. Boosted listings show a "Featured" badge.' },
      { q: 'Can I sell food or services?', a: 'Absolutely! VendoorX supports all legal products and services — food, fashion, electronics, textbooks, tutoring, graphic design, photography, and more.' },
    ],
  },
  {
    title: 'Payments & Wallets',
    icon: 'card',
    color: 'purple',
    questions: [
      { q: 'How does checkout payment work?', a: "When a buyer pays via Paystack, the money goes into escrow. After delivery is confirmed (or 24 hours with no dispute), funds are released to the seller's wallet minus the ₦100 VAT." },
      { q: 'How do I withdraw my wallet balance?', a: 'Go to Dashboard → Payouts. Connect your bank account, then click "Withdraw." Transfers are processed instantly via Paystack. Minimum withdrawal is ₦500.' },
      { q: 'What payment methods are accepted?', a: 'Paystack supports debit cards, bank transfers, USSD, and mobile money. For WhatsApp deals, payment is arranged directly between buyer and seller.' },
      { q: 'Is my payment information secure?', a: 'All payments are processed by Paystack, a PCI-DSS certified payment provider. VendoorX never stores your card details.' },
    ],
  },
  {
    title: 'Account & Security',
    icon: 'shield',
    color: 'orange',
    questions: [
      { q: 'How do I get verified as a seller?', a: 'Sign up with your email address. Your account is automatically flagged as a seller. Complete your profile with a clear photo to boost trust with buyers.' },
      { q: 'I forgot my password. What do I do?', a: "Click \"Sign in\" then \"Forgot password.\" Enter your email and we'll send a password reset link. Check your spam folder if you don't see it within 2 minutes." },
      { q: 'How do I report a fraudulent seller?', a: 'Click "Report" on any listing or seller profile. Fill in the reason and evidence. Our trust & safety team reviews reports within 24 hours and bans confirmed bad actors.' },
      { q: 'Can I delete my account?', a: 'Yes. Go to Settings → Account → Delete Account. Note: any active listings will be removed and pending wallet balance will be paid out first.' },
    ],
  },
]

export const DEFAULT_HELP_POPULAR: HelpQuestion[] = [
  { q: 'Is VendoorX completely free?', a: 'Joining is free. Listing is free. WhatsApp deals are free. A small ₦100 VAT applies only to Paystack checkout orders.' },
  { q: 'How long does delivery take?', a: "Delivery times vary by seller and location. Most sellers deliver within 1–3 hours for local orders. Check the listing for the seller's delivery details." },
  { q: 'Can I sell to buyers in other cities?', a: 'Yes! Your listings are visible to all users across Nigeria. You set your own delivery range and can ship nationwide.' },
]

export function parseHelpCategories(raw: string): HelpCategory[] {
  if (!raw) return DEFAULT_HELP_CATEGORIES
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as HelpCategory[]) : DEFAULT_HELP_CATEGORIES
  } catch { return DEFAULT_HELP_CATEGORIES }
}

export function parseHelpPopular(raw: string): HelpQuestion[] {
  if (!raw) return DEFAULT_HELP_POPULAR
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as HelpQuestion[]) : DEFAULT_HELP_POPULAR
  } catch { return DEFAULT_HELP_POPULAR }
}
