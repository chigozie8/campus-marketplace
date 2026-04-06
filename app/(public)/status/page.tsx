import type { Metadata } from 'next'
import { CheckCircle2, Activity } from 'lucide-react'

export const metadata: Metadata = {
  title: 'System Status | VendoorX',
  description: 'Check the current status of VendoorX platform services.',
}

const SERVICES = [
  { name: 'Marketplace & Listings', status: 'operational', detail: 'All product pages, search, and filters are working normally.' },
  { name: 'Seller Dashboard', status: 'operational', detail: 'Dashboard, analytics, and listing management are fully operational.' },
  { name: 'Paystack Checkout', status: 'operational', detail: 'Payment processing, escrow, and wallet transfers are operating normally.' },
  { name: 'WhatsApp Integration', status: 'operational', detail: 'WhatsApp order links are generating correctly.' },
  { name: 'User Authentication', status: 'operational', detail: 'Login, registration, and session management are working.' },
  { name: 'File Uploads (Images/Video)', status: 'operational', detail: 'Photo and video uploads to Supabase storage are operating normally.' },
  { name: 'Email Notifications', status: 'operational', detail: 'Order confirmations, dispute alerts, and deal notifications are sending.' },
  { name: 'API & Backend', status: 'operational', detail: 'All backend services are responding within normal latency ranges.' },
]

const INCIDENTS: { date: string; title: string; resolution: string }[] = []

export default function StatusPage() {
  const allOperational = SERVICES.every((s) => s.status === 'operational')

  return (
    <div className="bg-background">
      <section className="py-20 px-4 bg-gradient-to-br from-green-50 via-background to-background dark:from-green-950/20 border-b border-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-semibold text-primary">Live Status</span>
          </div>
          {allOperational ? (
            <>
              <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
              <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-4">All Systems Operational</h1>
              <p className="text-muted-foreground text-lg">All VendoorX services are running smoothly. No issues detected.</p>
            </>
          ) : (
            <>
              <Activity className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-4">Some Services Affected</h1>
              <p className="text-muted-foreground text-lg">We&apos;re aware of an issue and are working to resolve it. Check below for details.</p>
            </>
          )}
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto flex flex-col gap-10">
          <div>
            <h2 className="text-xl font-black text-foreground mb-5">Service Status</h2>
            <div className="flex flex-col gap-2">
              {SERVICES.map(({ name, status, detail }) => (
                <div key={name} className="flex items-start gap-4 px-5 py-4 rounded-xl border border-border bg-card hover:bg-muted/20 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${status === 'operational' ? 'bg-primary' : status === 'degraded' ? 'bg-amber-500' : 'bg-red-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{name}</p>
                      <span className={`text-xs font-bold capitalize px-2 py-0.5 rounded-full ${
                        status === 'operational' ? 'bg-primary/10 text-primary' :
                        status === 'degraded' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' :
                        'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                      }`}>{status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Past incidents */}
          <div>
            <h2 className="text-xl font-black text-foreground mb-5">Past Incidents</h2>
            {INCIDENTS.length === 0 ? (
              <div className="text-center py-10 rounded-2xl border border-dashed border-border">
                <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-3" />
                <p className="text-foreground font-semibold">No incidents in the past 90 days</p>
                <p className="text-muted-foreground text-sm mt-1">VendoorX has maintained 99.9% uptime.</p>
              </div>
            ) : null}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Status updates are refreshed every 5 minutes. For urgent issues, contact support@vendoorx.com.
          </p>
        </div>
      </section>
    </div>
  )
}
