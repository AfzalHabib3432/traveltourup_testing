"use client";

/**
 * Skeleton rows matching FlightList card layout (list variant) for loading / Suspense fallback.
 */
function FlightResultRowSkeleton() {
  return (
    <div
      className="mb-6 rounded-xl border border-border bg-card p-6 shadow-lg"
      aria-hidden
    >
      <div className="flex flex-col justify-between lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center">
            <div className="mr-3 h-10 w-10 shrink-0 animate-pulse rounded-full bg-muted" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-5 w-40 animate-pulse rounded-md bg-muted" />
              <div className="h-4 w-24 animate-pulse rounded-md bg-muted/80" />
            </div>
            <div className="ml-auto h-6 w-16 animate-pulse rounded bg-muted" />
          </div>
          <div className="mb-4 flex items-center justify-between">
            <div className="space-y-2 text-center">
              <div className="mx-auto h-8 w-14 animate-pulse rounded-md bg-muted" />
              <div className="mx-auto h-3 w-24 animate-pulse rounded bg-muted/80" />
            </div>
            <div className="flex-1 px-4">
              <div className="mx-auto mb-2 h-3 w-12 animate-pulse rounded bg-muted/80" />
              <div className="h-1 rounded-full bg-muted" />
            </div>
            <div className="space-y-2 text-center">
              <div className="mx-auto h-8 w-14 animate-pulse rounded-md bg-muted" />
              <div className="mx-auto h-3 w-24 animate-pulse rounded bg-muted/80" />
            </div>
          </div>
          <div className="mb-4 flex flex-wrap gap-3">
            <div className="h-4 w-16 animate-pulse rounded bg-muted/80" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted/80" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted/80" />
          </div>
        </div>
        <div className="mt-4 shrink-0 border-t pt-4 lg:ml-6 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div className="mb-2 text-right">
            <div className="ml-auto h-9 w-28 animate-pulse rounded-md bg-muted" />
            <div className="mt-2 ml-auto h-3 w-36 animate-pulse rounded bg-muted/80" />
          </div>
          <div className="h-11 w-full animate-pulse rounded-lg bg-muted md:w-40" />
        </div>
      </div>
    </div>
  );
}

export function FlightListSearchSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div
      className="w-full"
      role="status"
      aria-live="polite"
      aria-label="Loading flight search results"
    >
      {Array.from({ length: rows }, (_, i) => (
        <FlightResultRowSkeleton key={i} />
      ))}
    </div>
  );
}
