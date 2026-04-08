'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, MapPin, Briefcase, X, GripVertical } from 'lucide-react'

export type JobListing = {
  id: string
  title: string
  team: string
  location: string
  description: string
  employment_type: string
  status: 'active' | 'soon' | 'closed'
  sort_order: number
  created_at: string
}

type Props = { initialJobs: JobListing[] }

const BLANK: Omit<JobListing, 'id' | 'created_at'> = {
  title: '',
  team: '',
  location: '',
  description: '',
  employment_type: 'Full-time',
  status: 'soon',
  sort_order: 0,
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  soon: 'Coming Soon',
  closed: 'Closed',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
  soon: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  closed: 'bg-gray-100 text-gray-500 dark:bg-gray-900/40 dark:text-gray-500',
}

export function JobListingsManager({ initialJobs }: Props) {
  const [jobs, setJobs] = useState<JobListing[]>(initialJobs)
  const [editing, setEditing] = useState<(Omit<JobListing, 'id' | 'created_at'> & { id?: string }) | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  function openNew() {
    setEditing({ ...BLANK })
  }

  function openEdit(job: JobListing) {
    setEditing({ ...job })
  }

  function close() {
    setEditing(null)
  }

  async function handleSave() {
    if (!editing) return
    if (!editing.title.trim() || !editing.team.trim() || !editing.location.trim()) {
      alert('Title, team, and location are required.')
      return
    }
    setSaving(true)
    try {
      const isNew = !editing.id
      const url = isNew ? '/api/admin/jobs' : `/api/admin/jobs/${editing.id}`
      const method = isNew ? 'POST' : 'PATCH'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      })
      if (!res.ok) throw new Error('Save failed')
      const saved: JobListing = await res.json()
      setJobs(prev =>
        isNew
          ? [...prev, saved].sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at))
          : prev.map(j => j.id === saved.id ? saved : j)
      )
      close()
    } catch {
      alert('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this job listing? This cannot be undone.')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/jobs/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setJobs(prev => prev.filter(j => j.id !== id))
    } catch {
      alert('Failed to delete. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30'
  const labelCls = 'block text-xs font-bold text-muted-foreground mb-1'

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{jobs.length} listing{jobs.length !== 1 ? 's' : ''}</p>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-all"
        >
          <Plus className="w-4 h-4" /> Add Listing
        </button>
      </div>

      {/* Jobs list */}
      <div className="flex flex-col gap-3">
        {jobs.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm rounded-2xl border border-dashed border-border">
            No job listings yet. Add one above.
          </div>
        )}
        {jobs.map(job => (
          <div
            key={job.id}
            className="flex items-start justify-between gap-4 px-5 py-4 rounded-2xl border border-border bg-card hover:border-primary/20 transition-all group"
          >
            <div className="flex items-start gap-3 min-w-0">
              <GripVertical className="w-4 h-4 text-muted-foreground/40 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-foreground text-sm">{job.title}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[job.status]}`}>
                    {STATUS_LABELS[job.status]}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <Briefcase className="w-3 h-3 shrink-0" />
                  <span>{job.team}</span>
                  <span>·</span>
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span>{job.location}</span>
                  <span>·</span>
                  <span>{job.employment_type}</span>
                </div>
                {job.description && (
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{job.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => openEdit(job)}
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="Edit"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(job.id)}
                disabled={deleting === job.id}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-muted-foreground hover:text-red-500 disabled:opacity-40"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-base font-black text-foreground">
                {editing.id ? 'Edit Listing' : 'New Job Listing'}
              </h3>
              <button onClick={close} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className={labelCls}>Job title *</label>
                <input className={inputCls} value={editing.title} onChange={e => setEditing(p => p && { ...p, title: e.target.value })} placeholder="Software Engineer" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Team *</label>
                  <input className={inputCls} value={editing.team} onChange={e => setEditing(p => p && { ...p, team: e.target.value })} placeholder="Engineering" />
                </div>
                <div>
                  <label className={labelCls}>Location *</label>
                  <input className={inputCls} value={editing.location} onChange={e => setEditing(p => p && { ...p, location: e.target.value })} placeholder="Remote · Nigeria" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Employment type</label>
                  <select className={inputCls} value={editing.employment_type} onChange={e => setEditing(p => p && { ...p, employment_type: e.target.value })}>
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select className={inputCls} value={editing.status} onChange={e => setEditing(p => p && { ...p, status: e.target.value as JobListing['status'] })}>
                    <option value="active">Active (hiring now)</option>
                    <option value="soon">Coming Soon</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Description (optional)</label>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={4}
                  value={editing.description}
                  onChange={e => setEditing(p => p && { ...p, description: e.target.value })}
                  placeholder="Describe the role, responsibilities, and what you're looking for…"
                />
              </div>
              <div>
                <label className={labelCls}>Sort order (lower = first)</label>
                <input type="number" className={inputCls} value={editing.sort_order} onChange={e => setEditing(p => p && { ...p, sort_order: Number(e.target.value) })} />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-border flex justify-end gap-3">
              <button onClick={close} className="px-4 py-2 rounded-xl border border-border text-sm font-bold text-muted-foreground hover:bg-muted transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-all disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save listing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
