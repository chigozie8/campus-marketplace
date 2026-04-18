'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Loader2, Save, User, Camera, ExternalLink, ShieldCheck, Award,
  Star, Crown, BadgeCheck, GraduationCap, Sparkles, Briefcase, ChevronDown,
} from 'lucide-react'

const ADMIN_BADGES: Array<{ id: string; label: string; emoji: string }> = [
  { id: 'top_seller',         label: 'Top Seller',         emoji: '🏆' },
  { id: 'trusted_buyer',      label: 'Trusted Buyer',      emoji: '⭐' },
  { id: 'vip',                label: 'VIP Member',         emoji: '👑' },
  { id: 'verified_business',  label: 'Verified Business',  emoji: '✅' },
  { id: 'student_ambassador', label: 'Student Ambassador', emoji: '🎓' },
  { id: 'rising_star',        label: 'Rising Star',        emoji: '🌟' },
  { id: 'campus_vendor',      label: 'Campus Vendor',      emoji: '🏫' },
]

const CAMPUSES = [
  'UNILAG','UI','OAU','ABU','BUK','FUTA','COVENANT','UNILORIN','UNIBEN','UNN',
  'UNIPORT','LASU','OOU','FUTO','UNIZIK','UNIJOS','UNIUYO','BABCOCK','LANDMARK',
]

type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  whatsapp_number: string | null
  university: string | null
  campus: string | null
  bio: string | null
  instagram_handle: string | null
  facebook_handle: string | null
  is_seller: boolean | null
  seller_verified: boolean | null
  total_sales: number | null
  rating: number | null
  trust_score_override: number | null
  admin_badges: string[] | null
}

export function DemoSellerEditor({ onToast }: { onToast: (kind: 'ok' | 'err', text: string) => void }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/dummy/seller', { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Could not load demo seller.')
      setProfile(json.profile)
    } catch (e) {
      onToast('err', (e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  function patch<K extends keyof Profile>(k: K, v: Profile[K]) {
    setProfile((p) => (p ? { ...p, [k]: v } : p))
  }

  function toggleBadge(id: string) {
    if (!profile) return
    const cur = new Set(profile.admin_badges ?? [])
    if (cur.has(id)) cur.delete(id); else cur.add(id)
    patch('admin_badges', Array.from(cur))
  }

  async function uploadAvatar(file: File) {
    setUploadingAvatar(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Upload failed.')
      patch('avatar_url', json.url)
      onToast('ok', 'Avatar uploaded — click Save to persist.')
    } catch (e) {
      onToast('err', (e as Error).message)
    } finally {
      setUploadingAvatar(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function save() {
    if (!profile) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/dummy/seller', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: profile.full_name,
          whatsapp_number: profile.whatsapp_number,
          avatar_url: profile.avatar_url,
          university: profile.university,
          campus: profile.campus,
          bio: profile.bio,
          instagram_handle: profile.instagram_handle,
          facebook_handle: profile.facebook_handle,
          is_seller: profile.is_seller ?? true,
          seller_verified: profile.seller_verified ?? true,
          total_sales: profile.total_sales ?? 0,
          rating: profile.rating,
          trust_score_override: profile.trust_score_override,
          admin_badges: profile.admin_badges ?? [],
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Save failed.')
      setProfile(json.profile)
      onToast('ok', 'Demo seller saved.')
    } catch (e) {
      onToast('err', (e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-2 text-muted-foreground text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading demo seller…
      </div>
    )
  }
  if (!profile) return null

  const storeUrl = `/store/${profile.id}`

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Collapsed header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition text-left"
      >
        <div className="w-10 h-10 rounded-full overflow-hidden bg-muted ring-2 ring-emerald-200 dark:ring-emerald-900 shrink-0">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-emerald-600">
              <User className="w-5 h-5" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground text-sm truncate">{profile.full_name || 'VendoorX Demo Seller'}</span>
            {profile.seller_verified && (
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            )}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {profile.campus || 'No campus'} · {profile.total_sales ?? 0} sales · {(profile.admin_badges ?? []).length} badge{(profile.admin_badges ?? []).length === 1 ? '' : 's'}
          </div>
        </div>
        <a
          href={storeUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="hidden sm:inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          View store <ExternalLink className="w-3 h-3" />
        </a>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded form */}
      {open && (
        <div className="border-t border-border p-4 space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-muted ring-2 ring-emerald-200 dark:ring-emerald-900 shrink-0">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-emerald-600">
                  <User className="w-8 h-8" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold disabled:opacity-60"
                >
                  {uploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                  Upload from gallery
                </button>
                {profile.avatar_url && (
                  <button
                    onClick={() => patch('avatar_url', null)}
                    className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted"
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadAvatar(f) }}
              />
              <input
                value={profile.avatar_url ?? ''}
                onChange={(e) => patch('avatar_url', e.target.value || null)}
                placeholder="…or paste an image URL"
                className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-mono"
              />
            </div>
          </div>

          {/* Name + WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Display name">
              <input
                value={profile.full_name ?? ''}
                onChange={(e) => patch('full_name', e.target.value)}
                className="vx-input"
              />
            </Field>
            <Field label="WhatsApp number">
              <input
                value={profile.whatsapp_number ?? ''}
                onChange={(e) => patch('whatsapp_number', e.target.value)}
                placeholder="+2348012345678"
                className="vx-input"
              />
            </Field>
          </div>

          {/* University + Campus */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="University">
              <input
                value={profile.university ?? ''}
                onChange={(e) => patch('university', e.target.value)}
                placeholder="University of Lagos"
                className="vx-input"
              />
            </Field>
            <Field label="Campus">
              <input
                list="seller-campus-list"
                value={profile.campus ?? ''}
                onChange={(e) => patch('campus', e.target.value.toUpperCase())}
                className="vx-input"
              />
              <datalist id="seller-campus-list">
                {CAMPUSES.map((c) => <option key={c} value={c} />)}
              </datalist>
            </Field>
          </div>

          {/* Bio */}
          <Field label="Bio">
            <textarea
              value={profile.bio ?? ''}
              onChange={(e) => patch('bio', e.target.value || null)}
              rows={2}
              placeholder="Friendly student vendor on UNILAG campus, fast delivery, easy returns."
              className="vx-input resize-y"
            />
          </Field>

          {/* Socials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Instagram handle (no @)">
              <input
                value={profile.instagram_handle ?? ''}
                onChange={(e) => patch('instagram_handle', e.target.value || null)}
                placeholder="vendoorx"
                className="vx-input"
              />
            </Field>
            <Field label="Facebook handle">
              <input
                value={profile.facebook_handle ?? ''}
                onChange={(e) => patch('facebook_handle', e.target.value || null)}
                placeholder="vendoorx"
                className="vx-input"
              />
            </Field>
          </div>

          {/* Sales / rating / trust */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Field label="Total sales">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={profile.total_sales ?? 0}
                onChange={(e) => patch('total_sales', Number(e.target.value))}
                className="vx-input"
              />
            </Field>
            <Field label="Rating (0–5)">
              <input
                type="number"
                step="0.1"
                min={0}
                max={5}
                value={profile.rating ?? ''}
                onChange={(e) => patch('rating', e.target.value === '' ? null : Number(e.target.value))}
                placeholder="4.8"
                className="vx-input"
              />
            </Field>
            <Field label="Trust score (0–100)">
              <input
                type="number"
                min={0}
                max={100}
                value={profile.trust_score_override ?? ''}
                onChange={(e) => patch('trust_score_override', e.target.value === '' ? null : Number(e.target.value))}
                placeholder="Auto"
                className="vx-input"
              />
            </Field>
            <Field label="Verified">
              <button
                onClick={() => patch('seller_verified', !profile.seller_verified)}
                className={`w-full h-9 rounded-lg border text-xs font-bold inline-flex items-center justify-center gap-1.5 transition ${
                  profile.seller_verified
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'bg-background border-border text-muted-foreground'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                {profile.seller_verified ? 'Verified' : 'Unverified'}
              </button>
            </Field>
          </div>

          {/* Badges */}
          <Field label="Admin badges (click to toggle)">
            <div className="flex flex-wrap gap-2 pt-1">
              {ADMIN_BADGES.map((b) => {
                const on = (profile.admin_badges ?? []).includes(b.id)
                return (
                  <button
                    key={b.id}
                    onClick={() => toggleBadge(b.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
                      on
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                        : 'bg-background border-border text-muted-foreground hover:border-amber-300'
                    }`}
                  >
                    <span>{b.emoji}</span>{b.label}
                  </button>
                )
              })}
            </div>
          </Field>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-border">
            <a
              href={storeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-bold text-foreground hover:bg-muted"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View public store
            </a>
            <p className="text-[11px] text-muted-foreground sm:flex-1">
              You appear as this seller on every dummy listing — make-offer, chat and orders all flow to this profile.
            </p>
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-bold disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save seller
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        :global(.vx-input) {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid hsl(var(--border));
          background: hsl(var(--background));
          font-size: 0.875rem;
          color: hsl(var(--foreground));
        }
        :global(.vx-input:focus) {
          outline: 2px solid hsl(var(--primary) / 0.4);
          outline-offset: -1px;
        }
      `}</style>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}
