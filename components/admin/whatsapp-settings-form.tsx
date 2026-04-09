'use client'

import { useState } from 'react'
import { Eye, EyeOff, CheckCircle2, Loader2, MessageCircle, AlertCircle } from 'lucide-react'

interface Field {
  key: string
  label: string
  placeholder: string
  hint: string
  secret?: boolean
}

const FIELDS: Field[] = [
  {
    key:         'integration_gupshup_api_key',
    label:       'API Key',
    placeholder: 'Paste your Gupshup API key here',
    hint:        'Found in your Gupshup dashboard → Settings → API Key',
    secret:      true,
  },
  {
    key:         'integration_gupshup_app_name',
    label:       'App Name',
    placeholder: 'e.g. VendoorX',
    hint:        'The exact name of your app in the Gupshup dashboard',
  },
  {
    key:         'integration_gupshup_phone_number',
    label:       'WhatsApp Phone Number',
    placeholder: 'e.g. 2348012345678',
    hint:        'Your number without the + sign, with country code',
  },
]

interface Props {
  initialValues: Record<string, string>
}

export function WhatsAppSettingsForm({ initialValues }: Props) {
  const [values,  setValues]  = useState<Record<string, string>>(initialValues)
  const [visible, setVisible] = useState<Record<string, boolean>>({})
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  function toggleVisible(key: string) {
    setVisible(v => ({ ...v, [key]: !v[key] }))
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    setError(null)

    try {
      for (const field of FIELDS) {
        const value = values[field.key] ?? ''
        await fetch('/api/admin/site-settings', {
          method:  'PUT',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ key: field.key, value }),
        }).then(r => {
          if (!r.ok) throw new Error(`Failed to save ${field.label}`)
        })
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
          <MessageCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h4 className="font-black text-sm text-foreground">WhatsApp — Gupshup</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Enter your Gupshup credentials to activate the WhatsApp bot
          </p>
        </div>
      </div>

      {/* Fields */}
      <div className="p-5 space-y-5">
        {FIELDS.map(field => {
          const isSecret  = !!field.secret
          const isVisible = visible[field.key]
          const inputType = isSecret && !isVisible ? 'password' : 'text'

          return (
            <div key={field.key} className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                {field.label}
              </label>
              <div className="relative">
                <input
                  type={inputType}
                  value={values[field.key] ?? ''}
                  onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full h-10 px-3 pr-10 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
                {isSecret && (
                  <button
                    type="button"
                    onClick={() => toggleVisible(field.key)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                    tabIndex={-1}
                  >
                    {isVisible
                      ? <EyeOff className="w-4 h-4" />
                      : <Eye    className="w-4 h-4" />}
                  </button>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">{field.hint}</p>
            </div>
          )
        })}

        {/* Webhook hint */}
        <div className="rounded-xl bg-muted/50 border border-border px-4 py-3 space-y-1">
          <p className="text-xs font-bold text-foreground">Webhook URL (paste this in Gupshup)</p>
          <p className="text-xs text-muted-foreground font-mono break-all select-all">
            {typeof window !== 'undefined' ? `${window.location.origin.replace('5000', '3001')}/webhook/whatsapp` : 'https://your-domain/webhook/whatsapp'}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Go to Gupshup → your app → Settings → Callback URL and paste this.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Save button */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-9 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 disabled:opacity-60 transition flex items-center gap-2"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {saving ? 'Saving…' : 'Save Credentials'}
          </button>

          {saved && (
            <span className="flex items-center gap-1.5 text-sm font-semibold text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              Saved successfully!
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
