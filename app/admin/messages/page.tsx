import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MessageSquare, User, Bot } from 'lucide-react'

export default async function AdminMessagesPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const { data: messages } = await supabase
    .from('messages')
    .select('id, role, content, created_at, profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(200)

  // Group by user
  const byUser: Record<string, typeof messages> = {}
  for (const m of (messages ?? []) as any[]) {
    const name = m.profiles?.full_name ?? m.user_id ?? 'Unknown'
    if (!byUser[name]) byUser[name] = []
    byUser[name]!.push(m)
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
        {Object.entries(byUser).map(([userName, msgs]) => (
          <div key={userName} className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/40">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-xs font-black">{userName.charAt(0).toUpperCase()}</span>
              </div>
              <p className="font-bold text-sm text-foreground">{userName}</p>
              <span className="text-xs text-muted-foreground ml-auto">{(msgs ?? []).length} messages</span>
            </div>
            <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
              {(msgs ?? []).map((m: any) => (
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
        ))}
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
