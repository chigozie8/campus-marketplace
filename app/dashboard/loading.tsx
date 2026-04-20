/**
 * Skeleton placeholder shown while the server component fetches dashboard
 * data. Mirrors the actual layout so users don't see a layout shift on first
 * paint.
 */
export default function DashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28 lg:pb-10 space-y-5 animate-pulse">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-3 w-20 bg-gray-200 dark:bg-muted rounded" />
          <div className="h-7 w-40 bg-gray-200 dark:bg-muted rounded" />
          <div className="h-3 w-52 bg-gray-200 dark:bg-muted rounded" />
        </div>
        <div className="h-9 w-28 bg-gray-200 dark:bg-muted rounded-xl hidden sm:block" />
      </div>

      {/* Toggle */}
      <div className="h-10 w-44 bg-gray-200 dark:bg-muted rounded-2xl" />

      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="bg-white dark:bg-card rounded-2xl p-4 border border-gray-100 dark:border-border space-y-3">
            <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-muted" />
            <div className="h-6 w-16 bg-gray-200 dark:bg-muted rounded" />
            <div className="h-3 w-20 bg-gray-200 dark:bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Two-column row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="h-24 bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl" />
        <div className="h-24 bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl" />
      </div>

      {/* Activity feed */}
      <div className="h-48 bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl" />

      {/* Listings */}
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl overflow-hidden">
        <div className="h-12 border-b border-gray-100 dark:border-border" />
        {[0, 1, 2].map(i => (
          <div key={i} className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50 dark:border-border last:border-0">
            <div className="w-11 h-11 rounded-xl bg-gray-200 dark:bg-muted flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 bg-gray-200 dark:bg-muted rounded" />
              <div className="h-3 w-1/2 bg-gray-100 dark:bg-muted/60 rounded" />
            </div>
            <div className="h-6 w-14 bg-gray-200 dark:bg-muted rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
