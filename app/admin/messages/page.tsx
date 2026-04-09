import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import { MessageSquare, User, Bot } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminMessagesPage() {
  const svc = createServiceClient()
  if (!svc) redirect('/auth/login')

  const { data: messages, error } = await svc
    .from('messages')
    .select('id, user_id, role, content, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  const userIds = [...new Set((messages ?? []).map((m: { user_id: string }) => m.user_id).filter(Boolean))]

  const { data: profiles } = userIds.length > 0
    ? await svc.from('profiles').select('id, full_name').in('id', userIds)
    : { data: [] as Array<{ id: string; full_name: string | null }> }

  const profileMap: Record<string, string> = {}
  for (const p of profiles ?? []) {
    profileMap[p.id] = p.full_name ?? 'Unknown'
  }

  const byUser: Record<string, Array<{ id: string; user_id: string; role: string; content: string; created_at: string }>> = {}
  for (const m of (messages ?? []) as Array<{ id: string; user_id: string; role: string; content: string; created_at: string }>) {
    const key = m.user_id ?? 'anonymous'
    if (!byUser[key]) byUser[key] = []
    byUser[key].push(m)
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <div>
          <h2 className="text-lg font-black text-foreground tracking-tight">AI Chat Messages</h2>
        </div>
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-700 dark:text-red-400">
          Failed to load messages: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div>
        <h2 className="text-lg font-black text-foreground tracking-tight">AI Chat Messages</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {(messages ?? []).length} messages from {Object.keys(byUser).length} users
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries(byUser).map(([userId, msgs]) => {
          const displayName = profileMap[userId] ?? userId.slice(0, 8) + '…'
          return (
            <div key={userId} className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/40">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary text-xs font-black">{displayName.charAt(0).toUpperCase()}</span>
                </div>
                <p className="font-bold text-sm text-foreground">{displayName}</p>
                <span className="text-xs text-muted-foreground ml-auto">{msgs.length} messages</span>
              </div>
              <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                {msgs.map(m => (
                  <div key={m.id} className={`flex gap-2 ${m.role === 'assistant' ? 'justify-end' : ''}`}>
                    <div className={`flex items-start gap-2 max-w-[80%] ${m.role === 'assistant' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        m.role === 'assistant' ? 'bg-primary' : 'bg-muted'
                      }`}>
                        {m.role === 'assistant'
                          ? <Bot className="w-3 h-3 text-primary-foreground" />
                          : <User className="w-3 h-3 text-muted-foreground" />
                        }
                      </div>
                      <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                        m.role === 'assistant'
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : 'bg-muted text-foreground rounded-tl-sm'
                      }`}>
                        {m.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
        {Object.keys(byUser).length === 0 && (
          <div className="bg-card border border-border rounded-2xl flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No AI chat messages yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
