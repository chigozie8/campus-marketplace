'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Save, Info } from 'lucide-react'

interface Props {
  initialSettings: Record<string, string>
}

const FIELDS = [
  {
    key: 'referral_enabled',
    label: 'Enable Referral Program',
    type: 'toggle',
    hint: 'When off, referral links still work but no badges or rewards are granted.',
  },
  {
    key: 'referral_badge_1_threshold',
    label: '🌱 Starter Badge — min referrals',
    type: 'number',
    hint: 'Number of completed referrals needed to earn the Starter badge.',
  },
  {
    key: 'referral_badge_2_threshold',
    label: '⚡ Pro Badge — min referrals',
    type: 'number',
    hint: 'Number of completed referrals needed to earn the Pro badge.',
  },
  {
    key: 'referral_badge_3_threshold',
    label: '🏆 Champion Badge — min referrals',
    type: 'number',
    hint: 'Number of completed referrals needed to earn the Champion badge.',
  },
  {
    key: 'referral_badge_4_threshold',
    label: '👑 Legend Badge — min referrals',
    type: 'number',
    hint: 'Number of completed referrals needed to earn the Legend badge.',
  },
  {
    key: 'referral_reward_amount',
    label: 'Future Reward Amount (₦)',
    type: 'number',
    hint: 'Cash reward per referral when you enable cash payouts in the future. Not active yet.',
  },
  {
    key: 'referral_welcome_bonus',
    label: 'Welcome Bonus for New User (₦)',
    type: 'number',
    hint: 'Credit added to new users who joined via a referral link. Not active yet.',
  },
  {
    key: 'referral_reward_trigger',
    label: 'Reward Trigger',
    type: 'select',
    options: [
      { value: 'signup', label: 'On Signup' },
      { value: 'first_purchase', label: 'After First Purchase (recommended)' },
    ],
    hint: 'When the referral milestone is counted — on sign-up or after the referred user buys something.',
  },
]

export function ReferralSettingsEditor({ initialSettings }: Props) {
  const [values, setValues] = useState<Record<string, string>>(initialSettings)
  const [saving, setSaving] = useState(false)

  function set(key: string, value: string) {
    setValues(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: values }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      toast.success('Referral settings saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-black text-sm text-foreground">Program Settings</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure badge thresholds and future reward amounts
        </p>
      </div>
      <div className="divide-y divide-border">
        {FIELDS.map(field => (
          <div key={field.key} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{field.label}</p>
              {field.hint && (
                <p className="text-xs text-muted-foreground mt-0.5 flex items-start gap-1">
                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  {field.hint}
                </p>
              )}
            </div>
            <div className="flex-shrink-0">
              {field.type === 'toggle' ? (
                <button
                  onClick={() => set(field.key, values[field.key] === 'true' ? 'false' : 'true')}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    values[field.key] === 'true' ? 'bg-primary' : 'bg-muted'
                  }`}
                  aria-label="Toggle"
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    values[field.key] === 'true' ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              ) : field.type === 'select' ? (
                <select
                  value={values[field.key] ?? ''}
                  onChange={e => set(field.key, e.target.value)}
                  className="text-sm border border-border rounded-xl px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-[200px]"
                >
                  {field.options?.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  min={0}
                  value={values[field.key] ?? ''}
                  onChange={e => set(field.key, e.target.value)}
                  className="w-28 text-sm border border-border rounded-xl px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-right"
                />
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="px-5 py-4 border-t border-border flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
