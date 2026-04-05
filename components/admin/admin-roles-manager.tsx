'use client'

import { useState, useTransition } from 'react'
import { Shield, Trash2, Loader2, Plus, UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AdminRole {
  id: string
  user_id: string
  email: string
  role: string
  created_at: string
}

interface Props {
  admins: AdminRole[]
  isSuperAdmin: boolean
  currentUserId: string
}

export function AdminRolesManager({ admins, isSuperAdmin, currentUserId }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'super_admin'>('admin')
  const [error, setError] = useState('')

  async function handleAdd() {
    if (!email) return
    setLoadingId('new')
    setError('')
    const res = await fetch('/api/admin/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    })
    const json = await res.json()
    if (json.error) {
      setError(json.error)
    } else {
      setAdding(false)
      setEmail('')
      startTransition(() => router.refresh())
    }
    setLoadingId(null)
  }

  async function handleRemove(id: string, adminEmail: string) {
    if (!confirm(`Remove admin access for ${adminEmail}?`)) return
    setLoadingId(id)
    await fetch('/api/admin/roles', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setLoadingId(null)
    startTransition(() => router.refresh())
  }

  return (
    <div>
      <div className="divide-y divide-border">
        {admins.map(a => (
          <div key={a.id} className="flex items-center gap-3 px-5 py-3.5">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{a.email}</p>
              <p className="text-xs text-muted-foreground">
                {a.role === 'super_admin' ? 'Super Admin' : 'Admin'} &bull; since {new Date(a.created_at).toLocaleDateString()}
              </p>
            </div>
            {a.user_id === currentUserId && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">You</span>
            )}
            {isSuperAdmin && a.user_id !== currentUserId && (
              <button
                onClick={() => handleRemove(a.id, a.email)}
                disabled={loadingId === a.id}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all disabled:opacity-40"
              >
                {loadingId === a.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        ))}
      </div>

      {isSuperAdmin && (
        <div className="px-5 py-4 border-t border-border">
          {adding ? (
            <div className="space-y-3">
              <p className="text-sm font-bold text-foreground">Add Admin by Email</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as 'admin' | 'super_admin')}
                  className="px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={!email || loadingId === 'new'}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 disabled:opacity-40 transition-all"
                >
                  {loadingId === 'new' ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />}
                  Add Admin
                </button>
                <button
                  onClick={() => { setAdding(false); setError('') }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-accent transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add another admin
            </button>
          )}
        </div>
      )}
    </div>
  )
}
