import { Sparkles } from 'lucide-react'
import { DummyCatalog } from '@/components/admin/dummy-catalog'

export const dynamic = 'force-dynamic'

export default function AdminDummyPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Dummy data</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            Seed the marketplace with realistic-looking demo listings while you wait for real sellers
            to join. Click <span className="font-semibold text-foreground">Add</span> to publish an item
            instantly, or <span className="font-semibold text-foreground">Remove</span> to take it down.
            Every dummy listing is tagged so you can wipe them all in one click before launch.
          </p>
        </div>
      </div>
      <DummyCatalog />
    </div>
  )
}

