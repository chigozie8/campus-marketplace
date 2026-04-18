import { getSessionStatus } from '@/lib/whatsapp/consent'
import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react'

function timeAgo(ms: number): string {
  const diff = Date.now() - ms
  if (diff < 60_000) return 'just now'
  if (diff < 3_600_000) return `${Math.round(diff / 60_000)} min ago`
  if (diff < 86_400_000) return `${Math.round(diff / 3_600_000)} h ago`
  return `${Math.round(diff / 86_400_000)} d ago`
}

export async function WhatsAppStatusCard() {
  const apiKey         = process.env.WASENDER_API_KEY
  const webhookSecret  = process.env.WASENDER_WEBHOOK_SECRET
  const { status, at } = await getSessionStatus()

  const credsOk = Boolean(apiKey)
  const sigOk   = Boolean(webhookSecret)

  let dotColor  = 'bg-gray-400'
  let dotPulse  = false
  let badgeText = 'Not configured'
  let icon      = <Clock className="w-4 h-4 text-gray-500" />

  if (!credsOk) {
    dotColor  = 'bg-gray-400'
    badgeText = 'API key missing'
    icon      = <XCircle className="w-4 h-4 text-gray-500" />
  } else if (status === 'open' || status === 'connected' || status === 'authenticated') {
    dotColor  = 'bg-green-500'
    dotPulse  = true
    badgeText = 'Online'
    icon      = <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
  } else if (status === 'connecting' || status === 'qr') {
    dotColor  = 'bg-yellow-400'
    dotPulse  = true
    badgeText = 'Connecting…'
    icon      = <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
  } else if (status === 'close' || status === 'disconnected' || status === 'unauthorized') {
    dotColor  = 'bg-red-500'
    badgeText = 'Disconnected'
    icon      = <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
  } else {
    badgeText = 'Awaiting first event'
    icon      = <Clock className="w-4 h-4 text-gray-500" />
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
            {dotPulse && (
              <div className={`absolute inset-0 w-2.5 h-2.5 rounded-full ${dotColor} animate-ping opacity-75`} />
            )}
          </div>
          <div>
            <h4 className="font-black text-sm text-foreground">WhatsApp Status</h4>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
              {icon}
              {badgeText}
              {at && <span className="text-muted-foreground/70">· updated {timeAgo(at)}</span>}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-border text-center">
        <Stat label="API Key"        ok={credsOk} />
        <Stat label="Webhook Secret" ok={sigOk} />
        <Stat label="Anti-ban"       ok={true} />
      </div>
    </div>
  )
}

function Stat({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="px-3 py-3.5">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={`text-sm font-black mt-0.5 ${ok ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
        {ok ? 'Active' : 'Off'}
      </p>
    </div>
  )
}
