'use client'

import { useEffect, useState } from 'react'
import {
  Loader2, Save, Plus, Trash2, GripVertical, ChevronDown, ChevronUp,
  ShoppingBag, Package, CreditCard, Shield, Star, MessageCircle,
} from 'lucide-react'
import type { SiteSettings, HelpCategory, HelpQuestion } from '@/lib/site-settings-defaults'
import { parseHelpCategories, parseHelpPopular } from '@/lib/site-settings-defaults'

const ICONS: Array<HelpCategory['icon']> = ['shopping', 'package', 'card', 'shield', 'star', 'message', 'chat']
const ICON_LABEL: Record<HelpCategory['icon'], string> = {
  shopping: '🛍️ Shopping', package: '📦 Package', card: '💳 Card',
  shield: '🛡️ Shield', star: '⭐ Star', message: '💬 Message', chat: '💭 Chat',
}
const COLORS: Array<HelpCategory['color']> = ['blue', 'green', 'purple', 'orange', 'rose', 'amber', 'cyan']
const COLOR_DOT: Record<HelpCategory['color'], string> = {
  blue: 'bg-blue-500', green: 'bg-emerald-500', purple: 'bg-purple-500',
  orange: 'bg-orange-500', rose: 'bg-rose-500', amber: 'bg-amber-500', cyan: 'bg-cyan-500',
}

export function HelpCenterEditor({ initialSettings }: { initialSettings: SiteSettings }) {
  const [hero, setHero] = useState({
    help_hero_title: initialSettings.help_hero_title,
    help_hero_subtitle: initialSettings.help_hero_subtitle,
    help_search_placeholder: initialSettings.help_search_placeholder,
  })
  const [contact, setContact] = useState({
    help_contact_title: initialSettings.help_contact_title,
    help_contact_subtitle: initialSettings.help_contact_subtitle,
    help_contact_phone: initialSettings.help_contact_phone,
    help_contact_whatsapp_url: initialSettings.help_contact_whatsapp_url,
    help_contact_email: initialSettings.help_contact_email,
  })
  const [popular, setPopular] = useState<HelpQuestion[]>(parseHelpPopular(initialSettings.help_popular))
  const [categories, setCategories] = useState<HelpCategory[]>(parseHelpCategories(initialSettings.help_categories))
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [toast, setToast] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2800)
    return () => clearTimeout(t)
  }, [toast])

  async function saveSetting(key: keyof SiteSettings, value: string) {
    setSavingKey(key)
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Save failed')
      setToast({ kind: 'ok', text: 'Saved.' })
    } catch (e) {
      setToast({ kind: 'err', text: (e as Error).message })
    } finally {
      setSavingKey(null)
    }
  }

  const saveHero = () => Promise.all([
    saveSetting('help_hero_title', hero.help_hero_title),
    saveSetting('help_hero_subtitle', hero.help_hero_subtitle),
    saveSetting('help_search_placeholder', hero.help_search_placeholder),
  ])
  const saveContact = () => Promise.all([
    saveSetting('help_contact_title', contact.help_contact_title),
    saveSetting('help_contact_subtitle', contact.help_contact_subtitle),
    saveSetting('help_contact_phone', contact.help_contact_phone),
    saveSetting('help_contact_whatsapp_url', contact.help_contact_whatsapp_url),
    saveSetting('help_contact_email', contact.help_contact_email),
  ])
  const savePopular = () => saveSetting('help_popular', JSON.stringify(popular))
  const saveCategories = () => saveSetting('help_categories', JSON.stringify(categories))

  /* ── Popular ── */
  const addPopular = () => setPopular((p) => [...p, { q: 'New question', a: 'Answer goes here.' }])
  const updatePopular = (i: number, patch: Partial<HelpQuestion>) =>
    setPopular((p) => p.map((row, idx) => (idx === i ? { ...row, ...patch } : row)))
  const removePopular = (i: number) => setPopular((p) => p.filter((_, idx) => idx !== i))
  const movePopular = (i: number, dir: -1 | 1) =>
    setPopular((p) => {
      const j = i + dir
      if (j < 0 || j >= p.length) return p
      const next = [...p]; [next[i], next[j]] = [next[j], next[i]]; return next
    })

  /* ── Categories ── */
  const addCategory = () => setCategories((c) => [
    ...c,
    { title: 'New category', icon: 'message', color: 'blue', questions: [{ q: 'Question?', a: 'Answer.' }] },
  ])
  const updateCategory = (i: number, patch: Partial<HelpCategory>) =>
    setCategories((c) => c.map((row, idx) => (idx === i ? { ...row, ...patch } : row)))
  const removeCategory = (i: number) => setCategories((c) => c.filter((_, idx) => idx !== i))
  const moveCategory = (i: number, dir: -1 | 1) =>
    setCategories((c) => {
      const j = i + dir
      if (j < 0 || j >= c.length) return c
      const next = [...c]; [next[i], next[j]] = [next[j], next[i]]; return next
    })
  const addQuestion = (ci: number) =>
    setCategories((c) => c.map((row, idx) => idx === ci
      ? { ...row, questions: [...row.questions, { q: 'New question', a: 'Answer.' }] }
      : row))
  const updateQuestion = (ci: number, qi: number, patch: Partial<HelpQuestion>) =>
    setCategories((c) => c.map((row, idx) => idx === ci
      ? { ...row, questions: row.questions.map((q, qIdx) => qIdx === qi ? { ...q, ...patch } : q) }
      : row))
  const removeQuestion = (ci: number, qi: number) =>
    setCategories((c) => c.map((row, idx) => idx === ci
      ? { ...row, questions: row.questions.filter((_, qIdx) => qIdx !== qi) }
      : row))

  return (
    <div className="space-y-8 relative">
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl shadow-2xl border-2 text-sm font-bold ${
          toast.kind === 'ok'
            ? 'bg-emerald-500 border-emerald-400 text-white'
            : 'bg-red-500 border-red-400 text-white'
        }`}>{toast.text}</div>
      )}

      {/* HERO */}
      <Section title="Hero section" desc="The big banner at the top of the help page.">
        <Field label="Title">
          <input value={hero.help_hero_title} onChange={(e) => setHero({ ...hero, help_hero_title: e.target.value })} className="vx-input" />
        </Field>
        <Field label="Subtitle">
          <textarea value={hero.help_hero_subtitle} onChange={(e) => setHero({ ...hero, help_hero_subtitle: e.target.value })} rows={2} className="vx-input" />
        </Field>
        <Field label="Search bar placeholder">
          <input value={hero.help_search_placeholder} onChange={(e) => setHero({ ...hero, help_search_placeholder: e.target.value })} className="vx-input" />
        </Field>
        <SaveBtn loading={savingKey?.startsWith('help_hero') || savingKey === 'help_search_placeholder'} onClick={saveHero}>Save hero</SaveBtn>
      </Section>

      {/* POPULAR */}
      <Section title="Popular questions" desc="The 3 cards under the search bar — the most-asked questions.">
        <div className="space-y-3">
          {popular.map((p, i) => (
            <div key={i} className="rounded-xl border border-border bg-background p-3 space-y-2">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-[11px] font-bold uppercase text-muted-foreground">Question {i + 1}</span>
                <div className="ml-auto flex gap-1">
                  <IconBtn onClick={() => movePopular(i, -1)} disabled={i === 0}><ChevronUp className="w-3.5 h-3.5" /></IconBtn>
                  <IconBtn onClick={() => movePopular(i, 1)} disabled={i === popular.length - 1}><ChevronDown className="w-3.5 h-3.5" /></IconBtn>
                  <IconBtn onClick={() => removePopular(i)} danger><Trash2 className="w-3.5 h-3.5" /></IconBtn>
                </div>
              </div>
              <input value={p.q} onChange={(e) => updatePopular(i, { q: e.target.value })} placeholder="Question" className="vx-input" />
              <textarea value={p.a} onChange={(e) => updatePopular(i, { a: e.target.value })} rows={2} placeholder="Answer" className="vx-input" />
            </div>
          ))}
          <button onClick={addPopular} className="w-full py-2.5 rounded-xl border-2 border-dashed border-border hover:border-primary hover:text-primary text-sm font-bold text-muted-foreground transition flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Add popular question
          </button>
        </div>
        <SaveBtn loading={savingKey === 'help_popular'} onClick={savePopular}>Save popular questions</SaveBtn>
      </Section>

      {/* CATEGORIES */}
      <Section title="Help categories" desc="The big coloured cards lower down. Each has its own list of Q&A.">
        <div className="space-y-4">
          {categories.map((cat, ci) => (
            <details key={ci} open className="rounded-xl border-2 border-border bg-background overflow-hidden group">
              <summary className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-muted/30 list-none">
                <span className={`w-3 h-3 rounded-full ${COLOR_DOT[cat.color]} shrink-0`} />
                <span className="text-sm font-bold flex-1 truncate">{cat.title}</span>
                <span className="text-[11px] text-muted-foreground">{cat.questions.length} Q&amp;A</span>
                <div className="flex gap-1">
                  <IconBtn onClick={(e) => { e.preventDefault(); moveCategory(ci, -1) }} disabled={ci === 0}><ChevronUp className="w-3.5 h-3.5" /></IconBtn>
                  <IconBtn onClick={(e) => { e.preventDefault(); moveCategory(ci, 1) }} disabled={ci === categories.length - 1}><ChevronDown className="w-3.5 h-3.5" /></IconBtn>
                  <IconBtn onClick={(e) => { e.preventDefault(); removeCategory(ci) }} danger><Trash2 className="w-3.5 h-3.5" /></IconBtn>
                </div>
              </summary>
              <div className="p-3 space-y-3 border-t border-border">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Field label="Title">
                    <input value={cat.title} onChange={(e) => updateCategory(ci, { title: e.target.value })} className="vx-input" />
                  </Field>
                  <Field label="Icon">
                    <select value={cat.icon} onChange={(e) => updateCategory(ci, { icon: e.target.value as HelpCategory['icon'] })} className="vx-input">
                      {ICONS.map((i) => <option key={i} value={i}>{ICON_LABEL[i]}</option>)}
                    </select>
                  </Field>
                  <Field label="Colour">
                    <select value={cat.color} onChange={(e) => updateCategory(ci, { color: e.target.value as HelpCategory['color'] })} className="vx-input">
                      {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase text-muted-foreground">Questions</p>
                  {cat.questions.map((q, qi) => (
                    <div key={qi} className="rounded-lg border border-border bg-card p-2.5 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-muted-foreground">Q{qi + 1}</span>
                        <IconBtn className="ml-auto" onClick={() => removeQuestion(ci, qi)} danger><Trash2 className="w-3 h-3" /></IconBtn>
                      </div>
                      <input value={q.q} onChange={(e) => updateQuestion(ci, qi, { q: e.target.value })} placeholder="Question" className="vx-input" />
                      <textarea value={q.a} onChange={(e) => updateQuestion(ci, qi, { a: e.target.value })} rows={2} placeholder="Answer" className="vx-input" />
                    </div>
                  ))}
                  <button onClick={() => addQuestion(ci)} className="w-full py-2 rounded-lg border border-dashed border-border hover:border-primary hover:text-primary text-xs font-bold text-muted-foreground transition flex items-center justify-center gap-1.5">
                    <Plus className="w-3 h-3" /> Add question
                  </button>
                </div>
              </div>
            </details>
          ))}
          <button onClick={addCategory} className="w-full py-3 rounded-xl border-2 border-dashed border-border hover:border-primary hover:text-primary text-sm font-bold text-muted-foreground transition flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Add help category
          </button>
        </div>
        <SaveBtn loading={savingKey === 'help_categories'} onClick={saveCategories}>Save categories</SaveBtn>
      </Section>

      {/* CONTACT */}
      <Section title="Contact section" desc="The bottom 'Still need help?' panel.">
        <Field label="Title">
          <input value={contact.help_contact_title} onChange={(e) => setContact({ ...contact, help_contact_title: e.target.value })} className="vx-input" />
        </Field>
        <Field label="Subtitle">
          <textarea value={contact.help_contact_subtitle} onChange={(e) => setContact({ ...contact, help_contact_subtitle: e.target.value })} rows={2} className="vx-input" />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Phone number">
            <input value={contact.help_contact_phone} onChange={(e) => setContact({ ...contact, help_contact_phone: e.target.value })} className="vx-input" />
          </Field>
          <Field label="WhatsApp URL">
            <input value={contact.help_contact_whatsapp_url} onChange={(e) => setContact({ ...contact, help_contact_whatsapp_url: e.target.value })} className="vx-input" />
          </Field>
          <Field label="Email">
            <input value={contact.help_contact_email} onChange={(e) => setContact({ ...contact, help_contact_email: e.target.value })} className="vx-input" />
          </Field>
        </div>
        <SaveBtn loading={savingKey?.startsWith('help_contact')} onClick={saveContact}>Save contact</SaveBtn>
      </Section>

      <style jsx global>{`
        .vx-input {
          width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.5rem;
          border: 1px solid hsl(var(--border)); background: hsl(var(--background));
          font-size: 0.875rem; color: hsl(var(--foreground));
        }
        .vx-input:focus { outline: 2px solid hsl(var(--primary) / 0.4); outline-offset: -1px; }
      `}</style>
    </div>
  )
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div>
        <h4 className="text-sm font-black text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}

function SaveBtn({ loading, onClick, children }: { loading: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={loading} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-bold disabled:opacity-60">
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      {children}
    </button>
  )
}

function IconBtn({ onClick, disabled, danger, className, children }: {
  onClick: (e: React.MouseEvent) => void
  disabled?: boolean
  danger?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded-md border border-border bg-background hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition ${danger ? 'hover:text-red-600 hover:border-red-300' : ''} ${className ?? ''}`}
    >
      {children}
    </button>
  )
}
