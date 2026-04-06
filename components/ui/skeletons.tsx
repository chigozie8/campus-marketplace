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
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm h-14 flex items-center">
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
      <div className="sm:hidden bg-white border-b border-gray-100 px-4 py-3">
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>

      {/* Category pills */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-3">
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
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
      <div className="aspect-[4/3] bg-gray-100 animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
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
