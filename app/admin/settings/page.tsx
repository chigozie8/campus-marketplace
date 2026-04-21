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
import { getSiteSettings } from '@/lib/site-settings'
import {
  parseHiwSteps, parseFaqs, parseHeroFeatures, parseEscrowSteps, parseSectionVisibility,
} from '@/lib/site-settings-defaults'

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
