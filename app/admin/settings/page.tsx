import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import { AdminRolesManager } from '@/components/admin/admin-roles-manager'
import { SiteSettingsEditor } from '@/components/admin/site-settings-editor'
import { HelpCenterEditor } from '@/components/admin/help-center-editor'
import { WhatsAppSettingsForm } from '@/components/admin/whatsapp-settings-form'
import { PlatformFeeEditor } from '@/components/admin/platform-fee-editor'
import { JsonListEditor } from '@/components/admin/json-list-editor'
import { SectionVisibilityEditor } from '@/components/admin/section-visibility-editor'
import { LegalPagesEditor } from '@/components/admin/legal-pages-editor'
import { AdPopupEditor } from '@/components/admin/ad-popup-editor'
import { AppDownloadsEditor } from '@/components/admin/app-downloads-editor'
import { ScalarSettingEditor } from '@/components/admin/scalar-setting-editor'
import { getSiteSettings } from '@/lib/site-settings'
import {
  parseHiwSteps, parseFaqs, parseHeroFeatures, parseEscrowSteps, parseSectionVisibility,
  parseFooterSocials, parseCommunityChannels, parseCommunityAchievements,
} from '@/lib/site-settings-defaults'
import { SOCIAL_PLATFORMS } from '@/components/landing/social-icons'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: currentAdmin } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!currentAdmin) redirect('/')

  const isSuperAdmin = currentAdmin?.role === 'super_admin'

  // Use service role client to bypass RLS — the policy only lets each admin
  // see their own row, so the regular client would never return other admins.
  const sc = createServiceClient()
  const { data: admins } = sc
    ? await sc.from('admin_roles').select('id, user_id, email, role, created_at').order('created_at')
    : { data: null }

  const settings = await getSiteSettings()

  // Load saved WhatsApp / WaSender credentials from the DB
  const WA_KEYS = [
    'integration_wasender_api_key',
    'integration_wasender_webhook_secret',
  ]
  const sc2 = createServiceClient()
  const { data: waRows } = sc2
    ? await sc2.from('site_settings').select('key, value').in('key', WA_KEYS)
    : { data: null }
  const waValues = Object.fromEntries((waRows ?? []).map((r: { key: string; value: string }) => [r.key, r.value]))

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">

      <div>
        <h2 className="text-lg font-black text-foreground tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage fees, admin access, social links, platform stats, and site content</p>
      </div>

      <div>
        <h3 className="text-sm font-black text-foreground mb-4">💳 VAT & Fees</h3>
        <PlatformFeeEditor
          initialAmount={Number(settings.platform_fee_amount ?? 100)}
          initialLabel={settings.platform_fee_label ?? 'VAT & Service Fee'}
        />
      </div>

      <div>
        <h3 className="text-sm font-black text-foreground mb-4">WhatsApp Integration</h3>
        <WhatsAppSettingsForm
          initialValues={waValues}
          webhookUrl={`${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vendoorx.ng'}/api/webhook/whatsapp`}
        />
      </div>

      <div>
        <h3 className="text-sm font-black text-foreground mb-4">Site Content</h3>
        <SiteSettingsEditor initialSettings={settings} />
      </div>

      <div>
        <h3 className="text-sm font-black text-foreground mb-4">🏠 Homepage Sections</h3>
        <SectionVisibilityEditor initialValue={parseSectionVisibility(settings.homepage_sections_visible)} />
      </div>

      <div>
        <h3 className="text-sm font-black text-foreground mb-4">⭐ Hero Feature Pills</h3>
        <JsonListEditor
          settingKey="homepage_hero_features"
          title="Feature Pills under the headline"
          description="The small badges shown below the hero subtitle (e.g. '120+ Universities'). Icon names from lucide-react: GraduationCap, Shield, Zap, Users, Phone, Star, Heart."
          fields={[
            { key: 'icon', label: 'Icon name (lucide-react)', placeholder: 'GraduationCap' },
            { key: 'text', label: 'Pill text', placeholder: '120+ Nigerian Universities' },
          ]}
          initialItems={parseHeroFeatures(settings.homepage_hero_features) as unknown as { icon: string; text: string }[]}
          blankItem={{ icon: 'Star', text: '' }}
          maxItems={6}
        />
      </div>

      <div>
        <h3 className="text-sm font-black text-foreground mb-4">📋 How It Works — Steps</h3>
        <JsonListEditor
          settingKey="homepage_hiw_steps"
          title="Step-by-step content"
          description="The 4 cards in the How It Works section. Reorder, add, remove, or edit."
          fields={[
            { key: 'step',        label: 'Step number',  placeholder: '01' },
            { key: 'title',       label: 'Title',         placeholder: 'Create your free account' },
            { key: 'description', label: 'Description',   placeholder: 'Sign up in seconds...', type: 'textarea' },
          ]}
          initialItems={parseHiwSteps(settings.homepage_hiw_steps) as unknown as { step: string; title: string; description: string }[]}
          blankItem={{ step: '', title: '', description: '' }}
          maxItems={6}
        />
      </div>

      <div>
        <h3 className="text-sm font-black text-foreground mb-4">🔒 Escrow Flow Steps</h3>
        <JsonListEditor
          settingKey="homepage_escrow_steps"
          title="Escrow flow diagram"
          description="The 4-step trust diagram before the FAQ. Keeps to max 4 cards."
          fields={[
            { key: 'title',       label: 'Title',       placeholder: 'You pay securely' },
            { key: 'description', label: 'Description', placeholder: 'Buyer checks out via Paystack...', type: 'textarea' },
          ]}
          initialItems={parseEscrowSteps(settings.homepage_escrow_steps) as unknown as { title: string; description: string }[]}
          blankItem={{ title: '', description: '' }}
          maxItems={4}
        />
      </div>

      <div>
        <h3 className="text-sm font-black text-foreground mb-4">❓ Homepage FAQs</h3>
        <JsonListEditor
          settingKey="homepage_faqs"
          title="Frequently Asked Questions"
          description="Each FAQ is shown on the homepage in the order listed. Categories control the colour pill."
          fields={[
            { key: 'category', label: 'Category', placeholder: 'Getting Started', type: 'select', options: ['Getting Started', 'Payments', 'Platform', 'Billing'] },
            { key: 'q',        label: 'Question', placeholder: 'Is VendoorX completely free?' },
            { key: 'a',        label: 'Answer',   placeholder: 'Yes — joining VendoorX is...', type: 'textarea' },
          ]}
          initialItems={parseFaqs(settings.homepage_faqs) as unknown as { category: string; q: string; a: string }[]}
          blankItem={{ category: 'Getting Started', q: '', a: '' }}
        />
      </div>

      <div>
        <h3 className="text-sm font-black text-foreground mb-4">📚 Help Center</h3>
        <HelpCenterEditor initialSettings={settings} />
      </div>

      <div>
        <h3 className="text-sm font-black text-foreground mb-4">⚖️ Legal Pages</h3>
        <LegalPagesEditor
          initialValues={{
            legal_privacy_md: settings.legal_privacy_md,
            legal_terms_md:   settings.legal_terms_md,
            legal_cookies_md: settings.legal_cookies_md,
            legal_refund_md:  settings.legal_refund_md,
            legal_dispute_md: settings.legal_dispute_md,
            legal_trust_md:   settings.legal_trust_md,
          }}
          initialLastUpdated={settings.legal_last_updated}
        />
      </div>

      <div>
        <h3 className="text-sm font-black text-foreground mb-4">✉️ Contact Form Inbox</h3>
        <ScalarSettingEditor
          settingKey="contact_recipient_email"
          label="Where contact-form messages are delivered"
          description="Every submission to /contact is forwarded to this email address."
          initialValue={settings.contact_recipient_email || 'kenronkw@gmail.com'}
          placeholder="kenronkw@gmail.com"
          type="email"
          helpText="Use a real address you check. Sent via Mailtrap with the sender's address as the Reply-To, so you can reply directly."
        />
      </div>

      <div>
        <h3 className="text-sm font-black text-foreground mb-4">🌐 Footer — Social Links</h3>
        <JsonListEditor
          settingKey="footer_socials"
          title="Social network buttons"
          description="The coloured icons in the footer. Add, remove, reorder, or temporarily hide. Set Enabled to '0' to hide without losing the URL."
          fields={[
            { key: 'platform', label: 'Platform',  type: 'select', options: [...SOCIAL_PLATFORMS] },
            { key: 'label',    label: 'Label',     placeholder: 'WhatsApp' },
            { key: 'href',     label: 'URL',       placeholder: 'https://wa.me/15792583013' },
            { key: 'enabled',  label: 'Enabled?',  type: 'select', options: ['1', '0'] },
          ]}
          initialItems={parseFooterSocials(settings.footer_socials) as unknown as { platform: string; label: string; href: string; enabled: string }[]}
          blankItem={{ platform: 'whatsapp', label: '', href: '', enabled: '1' }}
          maxItems={10}
        />
      </div>

      <div>
        <h3 className="text-sm font-black text-foreground mb-4">© Footer Copyright</h3>
        <ScalarSettingEditor
          settingKey="footer_copyright"
          label="Copyright line"
          description="Shown at the bottom of every page. Use {year} as a placeholder for the current year."
          initialValue={settings.footer_copyright || '© {year} VendoorX Technologies Ltd. All rights reserved.'}
          placeholder="© {year} VendoorX Technologies Ltd. All rights reserved."
          helpText="Tip: include {year} so it stays current automatically every January."
        />
      </div>

      <div>
        <h3 className="text-sm font-black text-foreground mb-4">📣 Site-wide Ad Popup</h3>
        <AdPopupEditor
          initialValues={{
            enabled:       settings.ad_popup_enabled       ?? '0',
            title:         settings.ad_popup_title         ?? '',
            body:          settings.ad_popup_body          ?? '',
            image_url:     settings.ad_popup_image_url     ?? '',
            cta_label:     settings.ad_popup_cta_label     ?? '',
            cta_href:      settings.ad_popup_cta_href      ?? '',
            delay_ms:      settings.ad_popup_delay_ms      ?? '3000',
            auto_close_ms: settings.ad_popup_auto_close_ms ?? '0',
            frequency:     settings.ad_popup_frequency     ?? 'session',
          }}
        />
      </div>

      <div>
        <h3 className="text-sm font-black text-foreground mb-4">👥 Community Page — Hero</h3>
        <div className="space-y-3">
          <ScalarSettingEditor
            settingKey="community_hero_badge"
            label="Top badge label"
            description="The small pill at the top of the hero (e.g. 'Community')."
            initialValue={settings.community_hero_badge || 'Community'}
            placeholder="Community"
          />
          <ScalarSettingEditor
            settingKey="community_hero_title_line1"
            label="Headline — first line"
            description="The big bold first line of the hero title."
            initialValue={settings.community_hero_title_line1 || '50,000 sellers.'}
            placeholder="50,000 sellers."
          />
          <ScalarSettingEditor
            settingKey="community_hero_title_accent"
            label="Headline — accent line (green)"
            description="The second, accent-coloured line of the hero title."
            initialValue={settings.community_hero_title_accent || 'One community.'}
            placeholder="One community."
          />
          <ScalarSettingEditor
            settingKey="community_hero_subtitle"
            label="Subtitle paragraph"
            description="The descriptive paragraph under the headline."
            initialValue={settings.community_hero_subtitle || ''}
            placeholder="The VendoorX community is where..."
            type="textarea"
            rows={4}
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-black text-foreground mb-4">💬 Community Page — Channels</h3>
        <ScalarSettingEditor
          settingKey="community_section1_title"
          label="Section heading"
          description="The heading shown above the channel cards."
          initialValue={settings.community_section1_title || 'Join the Conversation'}
          placeholder="Join the Conversation"
        />
        <div className="mt-3">
          <JsonListEditor
            settingKey="community_channels"
            title="Channel cards (WhatsApp / Telegram / etc.)"
            description="Each card invites visitors to join a community channel. Icon names from lucide-react: MessageCircle, Users, Send, Phone, Heart, Sparkles, Globe, Instagram, Facebook, Youtube, Linkedin."
            fields={[
              { key: 'icon',        label: 'Icon name (lucide-react)', placeholder: 'MessageCircle' },
              { key: 'title',       label: 'Title',                    placeholder: 'WhatsApp Community' },
              { key: 'description', label: 'Description',              placeholder: 'Join our WhatsApp groups...', type: 'textarea' },
              { key: 'cta',         label: 'Button label',             placeholder: 'Join WhatsApp Community' },
              { key: 'href',        label: 'Button link',              placeholder: 'https://wa.me/2348000000000' },
              { key: 'color',       label: 'Header colour (hex)',      placeholder: '#25D366' },
            ]}
            initialItems={parseCommunityChannels(settings.community_channels) as unknown as { icon: string; title: string; description: string; cta: string; href: string; color: string }[]}
            blankItem={{ icon: 'MessageCircle', title: '', description: '', cta: '', href: '', color: '#25D366' }}
            maxItems={6}
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-black text-foreground mb-4">🏆 Community Page — Recognition</h3>
        <ScalarSettingEditor
          settingKey="community_section2_title"
          label="Section heading"
          description="The heading shown above the recognition / achievement cards."
          initialValue={settings.community_section2_title || 'Community Recognition'}
          placeholder="Community Recognition"
        />
        <div className="mt-3">
          <JsonListEditor
            settingKey="community_achievements"
            title="Achievement / badge cards"
            description="Recognition badges shown to the community. Icon names from lucide-react: Trophy, Star, Zap, Users, Heart, Sparkles."
            fields={[
              { key: 'icon',        label: 'Icon name (lucide-react)', placeholder: 'Trophy' },
              { key: 'label',       label: 'Badge name',               placeholder: 'Top Seller' },
              { key: 'description', label: 'Description',              placeholder: 'Monthly award for...', type: 'textarea' },
              { key: 'palette',     label: 'Colour palette',           type: 'select',
                options: ['amber', 'purple', 'blue', 'green', 'red', 'pink', 'teal', 'cyan', 'orange'] },
            ]}
            initialItems={parseCommunityAchievements(settings.community_achievements) as unknown as { icon: string; label: string; description: string; palette: string }[]}
            blankItem={{ icon: 'Trophy', label: '', description: '', palette: 'amber' }}
            maxItems={8}
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-black text-foreground mb-4">🚀 Community Page — Bottom CTA</h3>
        <div className="space-y-3">
          <ScalarSettingEditor
            settingKey="community_cta_title"
            label="CTA heading"
            initialValue={settings.community_cta_title || 'Start your journey today'}
            placeholder="Start your journey today"
          />
          <ScalarSettingEditor
            settingKey="community_cta_body"
            label="CTA paragraph"
            initialValue={settings.community_cta_body || ''}
            placeholder="Join VendoorX free, build your store..."
            type="textarea"
            rows={3}
          />
          <ScalarSettingEditor
            settingKey="community_cta_button_label"
            label="Button label"
            initialValue={settings.community_cta_button_label || 'Join VendoorX'}
            placeholder="Join VendoorX"
          />
          <ScalarSettingEditor
            settingKey="community_cta_button_href"
            label="Button link"
            description="Where the CTA button takes the visitor. Use an internal path like /auth/sign-up or a full URL."
            initialValue={settings.community_cta_button_href || '/auth/sign-up'}
            placeholder="/auth/sign-up"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-black text-foreground mb-4">📱 App Downloads (APK + iOS)</h3>
        <AppDownloadsEditor
          initialValues={{
            apk_download_url: settings.apk_download_url ?? '',
            apk_version:      settings.apk_version      ?? '',
            ios_download_url: settings.ios_download_url ?? '',
            ios_version:      settings.ios_version      ?? '',
          }}
        />
      </div>

      <div>
        <h3 className="text-sm font-black text-foreground mb-4">Admin Team</h3>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h4 className="font-black text-sm text-foreground">Admin Roles</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isSuperAdmin ? 'As Super Admin, you can add and remove other admins.' : 'Contact a Super Admin to manage team members.'}
            </p>
          </div>
          <AdminRolesManager admins={admins ?? []} isSuperAdmin={isSuperAdmin} currentUserId={user.id} />
        </div>
      </div>
    </div>
  )
}
