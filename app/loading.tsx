export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-background animate-pulse">
      {/* Nav skeleton */}
      <header className="sticky top-0 z-40 bg-white dark:bg-card border-b border-gray-100 dark:border-border h-16 flex items-center px-4 sm:px-6">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          <div className="h-6 w-28 bg-gray-200 dark:bg-muted rounded-lg" />
          <div className="hidden sm:flex flex-1 max-w-sm h-10 bg-gray-100 dark:bg-muted rounded-xl" />
          <div className="flex items-center gap-2">
            <div className="h-9 w-20 bg-gray-100 dark:bg-muted rounded-xl" />
            <div className="h-9 w-24 bg-gray-200 dark:bg-muted rounded-xl" />
          </div>
        </div>
      </header>

      {/* Hero skeleton */}
      <div className="bg-gray-900 h-48 sm:h-56" />

      {/* Category pills skeleton */}
      <div className="bg-white dark:bg-card border-b border-gray-100 dark:border-border px-4 py-3">
        <div className="flex gap-2 overflow-hidden max-w-7xl mx-auto">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 h-8 w-20 bg-gray-100 dark:bg-muted rounded-xl" />
          ))}
        </div>
      </div>

      {/* Content grid skeleton */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28">
        <div className="flex items-center justify-between mb-5">
          <div className="space-y-1.5">
            <div className="h-5 w-36 bg-gray-200 dark:bg-muted rounded" />
            <div className="h-3 w-24 bg-gray-100 dark:bg-muted rounded" />
          </div>
          <div className="h-8 w-20 bg-gray-100 dark:bg-muted rounded-xl" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 dark:border-border bg-white dark:bg-card overflow-hidden shadow-sm">
              <div className="aspect-[4/3] bg-gray-100 dark:bg-muted" />
              <div className="p-2.5 sm:p-3.5 space-y-2">
                <div className="h-3 bg-gray-100 dark:bg-muted rounded w-full" />
                <div className="h-3 bg-gray-100 dark:bg-muted rounded w-2/3" />
                <div className="h-4 bg-gray-100 dark:bg-muted rounded w-1/2" />
                <div className="h-8 bg-gray-100 dark:bg-muted rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
