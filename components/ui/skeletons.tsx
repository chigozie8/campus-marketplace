import { cn } from '@/lib/utils'

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-secondary',
        className
      )}
    />
  )
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar skeleton */}
      <aside className="hidden md:flex flex-col w-60 border-r border-border bg-sidebar fixed h-full z-30 p-4 gap-3">
        <div className="flex items-center gap-2 pb-4 border-b border-sidebar-border">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex-1 space-y-2 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-lg" />
          ))}
        </div>
        <div className="border-t border-sidebar-border pt-4 flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </aside>

      {/* Mobile top bar skeleton */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 border-b border-border/50 bg-background flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-7 h-7 rounded-lg" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>

      {/* Main content skeleton */}
      <main className="flex-1 md:ml-60 overflow-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 mt-14 md:mt-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="space-y-2">
              <Skeleton className="h-7 w-52" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="hidden sm:block h-9 w-32 rounded-lg" />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-5 rounded-2xl border border-border/50 bg-card space-y-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>

          {/* Listings */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-14" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card">
                  <Skeleton className="w-14 h-14 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Skeleton className="h-5 w-14 rounded-full" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export function MarketplaceSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border shadow-sm h-14 flex items-center">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Skeleton className="w-7 h-7 rounded-lg" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="hidden sm:block h-9 flex-1 max-w-md rounded-xl" />
          <div className="flex items-center gap-2 flex-shrink-0">
            <Skeleton className="h-8 w-20 rounded-xl" />
            <Skeleton className="h-8 w-16 rounded-xl" />
          </div>
        </div>
      </header>

      {/* Hero banner */}
      <div className="bg-[#0a0a0a] py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-3">
          <Skeleton className="h-4 w-32 rounded-full bg-white/10" />
          <Skeleton className="h-9 w-56 rounded-lg bg-white/10" />
          <Skeleton className="h-4 w-72 rounded bg-white/10" />
          <div className="flex gap-6 pt-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-6 w-14 bg-white/10 rounded" />
                <Skeleton className="h-3 w-10 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile search */}
      <div className="sm:hidden bg-background border-b border-border px-4 py-3">
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>

      {/* Category pills */}
      <div className="bg-background border-b border-border px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex gap-2 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-xl flex-shrink-0" />
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-5">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-28" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-9 w-16 rounded-xl" />
          </div>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <MarketplaceCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  )
}

function MarketplaceCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-border bg-white dark:bg-card overflow-hidden shadow-sm">
      <div className="aspect-[4/3] bg-gray-100 dark:bg-muted animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent" />
      </div>
      <div className="p-2.5 sm:p-3.5 space-y-2">
        <div className="space-y-1">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <Skeleton className="h-5 w-1/2" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-14 rounded-full" />
          <Skeleton className="h-3 w-12 rounded-full" />
        </div>
        <Skeleton className="h-8 sm:h-9 w-full rounded-xl" />
      </div>
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="p-4 space-y-3">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-6 w-1/3" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
    </div>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 h-16 border-b border-border/50 bg-background/80 backdrop-blur-sm flex items-center px-4 sm:px-6">
        <div className="max-w-7xl mx-auto w-full flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image skeleton */}
          <div className="space-y-3">
            <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="w-20 h-16 rounded-lg flex-shrink-0" />
              ))}
            </div>
          </div>

          {/* Details skeleton */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-9 w-32" />
            </div>

            <Skeleton className="h-4 w-40" />

            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            <Skeleton className="h-20 w-full rounded-xl" />

            <div className="space-y-3">
              <Skeleton className="h-12 w-full rounded-xl" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 h-16 border-b border-border/50 bg-background/80 backdrop-blur-sm flex items-center px-4 sm:px-6">
        <div className="max-w-2xl mx-auto w-full flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-4 w-24" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Avatar + name */}
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        {/* Form fields */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}

        <Skeleton className="h-10 w-32 rounded-lg" />
      </main>
    </div>
  )
}

export function AuthSkeleton() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>

        {/* Form */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>

        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
    </div>
  )
}

export function FavoritesSkeleton() {
  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <header className="sticky top-0 z-40 bg-white dark:bg-card border-b border-gray-100 dark:border-border h-14 flex items-center px-4 sm:px-6">
        <div className="max-w-7xl mx-auto w-full flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-5 w-28" />
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-5">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 dark:border-border bg-white dark:bg-card overflow-hidden">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-8 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export function OrdersSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 h-16 border-b border-border/50 bg-background/80 backdrop-blur-sm flex items-center px-4 sm:px-6">
        <div className="max-w-3xl mx-auto w-full flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-5 w-24" />
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        <div className="flex gap-2 mb-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-xl" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/50 bg-card p-4 space-y-3">
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="flex flex-col items-end gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-9 flex-1 rounded-xl" />
              <Skeleton className="h-9 flex-1 rounded-xl" />
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}

export function InboxSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 h-16 border-b border-border/50 bg-background/80 backdrop-blur-sm flex items-center px-4 sm:px-6">
        <div className="max-w-2xl mx-auto w-full flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-5 w-16" />
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-4 space-y-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-2xl">
            <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-3 w-full max-w-xs" />
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}

export function NotificationsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 h-16 border-b border-border/50 bg-background/80 backdrop-blur-sm flex items-center px-4 sm:px-6">
        <div className="max-w-2xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-4 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4 p-4 rounded-2xl border border-border/40 bg-card">
            <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full max-w-sm" />
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}

export function BlogPostGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
          <Skeleton className="aspect-[16/10] w-full rounded-none" />
          <div className="p-4 sm:p-5 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <div className="flex gap-1 mt-1">
              <Skeleton className="h-5 w-12 rounded" />
              <Skeleton className="h-5 w-14 rounded" />
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex gap-3">
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-8" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-3 w-6" />
                <Skeleton className="h-3 w-6" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function PublicPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 h-16 border-b border-border/50 bg-background/80 backdrop-blur-sm flex items-center px-4 sm:px-6">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="hidden sm:flex items-center gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-14" />
            ))}
          </div>
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 flex flex-col items-center text-center gap-5">
        <Skeleton className="h-5 w-32 rounded-full" />
        <Skeleton className="h-11 w-72 sm:w-96" />
        <Skeleton className="h-11 w-56 sm:w-80" />
        <Skeleton className="h-4 w-full max-w-lg" />
        <Skeleton className="h-4 w-full max-w-md" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-11 w-32 rounded-xl" />
          <Skeleton className="h-11 w-28 rounded-xl" />
        </div>
      </section>

      {/* Content sections */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/50 bg-card p-6 space-y-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-4">
        <Skeleton className="h-7 w-48 mx-auto" />
        <Skeleton className="h-4 w-72 mx-auto" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-5 rounded-2xl border border-border/50 bg-card">
              <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export function StoreSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 h-14 border-b border-border/50 bg-background/80 backdrop-blur-sm flex items-center px-4 sm:px-6">
        <div className="max-w-5xl mx-auto w-full flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-4 w-32" />
        </div>
      </header>

      {/* Store banner + avatar */}
      <div className="bg-muted/40 h-32 sm:h-44 relative">
        <div className="absolute -bottom-10 left-4 sm:left-8">
          <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-background" />
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-14 pb-12 space-y-8">
        {/* Store info */}
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-4 w-full max-w-sm" />
          <div className="flex gap-3 pt-1">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Skeleton className="h-10 w-36 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>

        {/* Products grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/50 bg-card overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-8 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export function AdminSkeleton() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-sidebar fixed h-full z-30 p-4 gap-3">
        <div className="flex items-center gap-2 pb-4 border-b border-sidebar-border">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-10 rounded-full ml-auto" />
        </div>
        <div className="space-y-1 pt-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-lg" />
          ))}
        </div>
        <div className="mt-auto border-t border-sidebar-border pt-4 flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </aside>

      {/* Mobile topbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 border-b border-border bg-background flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-7 h-7 rounded-lg" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>

      {/* Main */}
      <main className="flex-1 lg:ml-64 overflow-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 mt-14 lg:mt-0">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="hidden sm:block h-9 w-28 rounded-lg" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-5 rounded-2xl border border-border/50 bg-card space-y-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <Skeleton className="h-5 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-36 rounded-lg" />
                <Skeleton className="h-9 w-24 rounded-lg" />
              </div>
            </div>
            <div className="divide-y divide-border/50">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3.5">
                  <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export function OrderDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 h-16 border-b border-border/50 bg-background/80 backdrop-blur-sm flex items-center px-4 sm:px-6">
        <div className="max-w-3xl mx-auto w-full flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-20 rounded-full ml-auto" />
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Order progress */}
        <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                {i < 3 && <Skeleton className="h-0.5 flex-1" />}
              </div>
            ))}
          </div>
        </div>

        {/* Product */}
        <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-4">
          <Skeleton className="h-5 w-24" />
          <div className="flex gap-4">
            <Skeleton className="w-20 h-20 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full max-w-xs" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border/50 bg-card p-5 space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
          ))}
        </div>

        {/* Price summary */}
        <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-3">
          <Skeleton className="h-4 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      </main>
    </div>
  )
}

export function SellerFormSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 h-16 border-b border-border/50 bg-background/80 backdrop-blur-sm flex items-center px-4 sm:px-6">
        <div className="max-w-2xl mx-auto w-full flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-5 w-36" />
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Image upload area */}
        <div className="rounded-2xl border-2 border-dashed border-border/60 bg-muted/30 p-8 flex flex-col items-center gap-3">
          <Skeleton className="w-14 h-14 rounded-xl" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>

        {/* Form fields */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className={`w-full rounded-lg ${i === 2 ? 'h-24' : 'h-10'}`} />
          </div>
        ))}

        {/* Price + category row */}
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>

        <Skeleton className="h-11 w-full rounded-xl" />
      </main>
    </div>
  )
}

export function WalletSkeleton() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar — matches dashboard layout */}
      <aside className="hidden md:flex flex-col w-60 border-r border-border bg-sidebar fixed h-full z-30 p-4 gap-3">
        <div className="flex items-center gap-2 pb-4 border-b border-sidebar-border">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex-1 space-y-2 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-lg" />
          ))}
        </div>
        <div className="border-t border-sidebar-border pt-4 flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 border-b border-border/50 bg-background flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-7 h-7 rounded-lg" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>

      <main className="flex-1 md:ml-60 overflow-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 mt-14 md:mt-0 space-y-6">
          <div className="space-y-1">
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-4 w-48" />
          </div>

          {/* Balance card */}
          <div className="rounded-2xl bg-primary/10 border border-primary/20 p-6 space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-36" />
            <div className="flex gap-3 pt-1">
              <Skeleton className="h-10 flex-1 rounded-xl" />
              <Skeleton className="h-10 flex-1 rounded-xl" />
            </div>
          </div>

          {/* Transactions */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-28" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card">
                <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-3 w-12 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export function AnalyticsSkeleton() {
  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex flex-col w-60 border-r border-border bg-sidebar fixed h-full z-30 p-4 gap-3">
        <div className="flex items-center gap-2 pb-4 border-b border-sidebar-border">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex-1 space-y-2 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-lg" />
          ))}
        </div>
        <div className="border-t border-sidebar-border pt-4 flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 border-b border-border/50 bg-background flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-7 h-7 rounded-lg" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>

      <main className="flex-1 md:ml-60 overflow-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 mt-14 md:mt-0 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-9 w-36 rounded-lg" />
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-5 rounded-2xl border border-border/50 bg-card space-y-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-8 w-28 rounded-lg" />
            </div>
            <Skeleton className="h-52 w-full rounded-xl" />
          </div>

          {/* Second chart */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/50 bg-card p-5 space-y-3">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-40 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export function PaymentCallbackSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-5">
        <Skeleton className="w-20 h-20 rounded-full" />
        <div className="space-y-2 text-center">
          <Skeleton className="h-7 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function AssistantSkeleton() {
  return (
    <div className="flex flex-col h-[100dvh] bg-white dark:bg-background overflow-hidden">
      <header className="flex-shrink-0 border-b border-gray-100 dark:border-border h-14 flex items-center px-4 sm:px-6">
        <div className="max-w-3xl mx-auto w-full flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-xl" />
          <div className="flex items-center gap-2.5 flex-1">
            <Skeleton className="w-9 h-9 rounded-2xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 px-4 sm:px-6 py-6 space-y-4 max-w-3xl mx-auto w-full">
        <div className="flex gap-3 items-end">
          <Skeleton className="w-9 h-9 rounded-2xl flex-shrink-0" />
          <Skeleton className="h-20 w-64 rounded-3xl rounded-tl-md" />
        </div>
        <div className="flex gap-3 items-end flex-row-reverse">
          <Skeleton className="w-8 h-8 rounded-2xl flex-shrink-0" />
          <Skeleton className="h-12 w-48 rounded-3xl rounded-br-md" />
        </div>
        <div className="flex gap-3 items-end">
          <Skeleton className="w-9 h-9 rounded-2xl flex-shrink-0" />
          <Skeleton className="h-16 w-72 rounded-3xl rounded-tl-md" />
        </div>
      </main>
      <div className="flex-shrink-0 border-t border-gray-100 px-4 sm:px-6 py-3 pb-4">
        <div className="max-w-3xl mx-auto flex items-end gap-2.5">
          <Skeleton className="flex-1 h-12 rounded-3xl" />
          <Skeleton className="w-12 h-12 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
