import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, Plus, ShoppingBag, GraduationCap } from 'lucide-react'

interface Props {
  university?: string | null
}

/**
 * Replaces the generic "no listings" panel with something a brand-new seller
 * can actually act on: a step-by-step suggested next action plus three
 * starter category prompts based on what tends to sell on student campuses.
 */
export function SmartEmptyState({ university }: Props) {
  return (
    <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm overflow-hidden">
      <div className="px-5 sm:px-7 py-7 text-center">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-100 dark:from-primary/15 dark:to-emerald-950/20 items-center justify-center mb-4">
          <Sparkles className="w-7 h-7 text-primary" />
        </div>
        <h3 className="text-base font-black text-gray-900 dark:text-white">Set up your first listing</h3>
        <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1.5 max-w-md mx-auto leading-relaxed">
          Sellers who post within their first day get <span className="font-bold text-gray-700 dark:text-foreground">3× more inquiries</span> in their first week. It takes about 60 seconds.
        </p>
        <Button asChild className="mt-5 bg-gray-950 hover:bg-gray-800 text-white rounded-xl text-xs h-10 px-5 shadow-lg shadow-black/10 hover:-translate-y-0.5 transition-all">
          <Link href="/seller/new"><Plus className="w-3.5 h-3.5 mr-1.5" />Create your first listing</Link>
        </Button>
      </div>

      <div className="border-t border-gray-100 dark:border-border bg-gray-50/60 dark:bg-muted/20 px-5 sm:px-7 py-4">
        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2.5 flex items-center gap-1.5">
          {university
            ? <><GraduationCap className="w-3 h-3" /> Popular at {university}</>
            : <><ShoppingBag className="w-3 h-3" /> Popular on VendoorX</>
          }
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Phones & Gadgets', emoji: '📱' },
            { label: 'Fashion & Style', emoji: '👕' },
            { label: 'Books & Notes', emoji: '📚' },
          ].map(({ label, emoji }) => (
            <Link
              key={label}
              href={`/seller/new?category=${encodeURIComponent(label)}`}
              className="flex flex-col items-center gap-1 px-2 py-3 rounded-xl bg-white dark:bg-card border border-gray-100 dark:border-border hover:border-primary/30 hover:shadow-sm transition-all text-center"
            >
              <span className="text-lg">{emoji}</span>
              <span className="text-[10px] font-bold text-gray-700 dark:text-foreground leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
