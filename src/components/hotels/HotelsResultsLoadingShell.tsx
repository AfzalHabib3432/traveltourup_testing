"use client";

import { HotelSearchResultSkeleton } from "@/components/hotels/HotelSearchResultSkeleton";

/**
 * Mirrors {@link HotelsList} chrome (header, sort row, desktop filter column, list skeleton)
 * for instant feedback while the results chunk loads or hydrates.
 */
export function HotelsResultsLoadingShell() {
  return (
    <div
      className="min-h-screen bg-muted"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading hotel results"
    >
      <div className="border-b border-border/60 bg-muted shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-4">
          <div className="h-8 max-w-[14rem] animate-pulse rounded-md bg-muted-foreground/15" />
          <div className="mt-2 h-4 max-w-2xl animate-pulse rounded bg-muted-foreground/10" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-2 flex flex-col gap-3 sm:gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-4">
          <div className="h-12 w-full animate-pulse rounded-lg border border-input bg-card/80 sm:h-11 lg:h-10 lg:max-w-[280px]" />
          <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-3 py-2 lg:w-auto lg:flex-nowrap">
            <div className="h-4 w-40 animate-pulse rounded bg-muted-foreground/10 sm:w-48" />
            <div className="h-5 w-24 animate-pulse rounded bg-muted-foreground/10" />
          </div>
        </div>

        <div className="mb-4 lg:hidden">
          <div className="h-12 w-full animate-pulse rounded-lg bg-primary/25" />
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="hidden lg:block lg:w-1/4">
            <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div className="h-5 w-28 animate-pulse rounded bg-muted-foreground/15" />
                <div className="h-4 w-16 animate-pulse rounded bg-muted-foreground/10" />
              </div>
              <div>
                <div className="mb-2 h-4 w-32 animate-pulse rounded bg-muted-foreground/12" />
                <div className="mb-3 flex gap-2">
                  <div className="h-10 flex-1 animate-pulse rounded-md border border-border/60 bg-muted/50" />
                  <div className="h-10 flex-1 animate-pulse rounded-md border border-border/60 bg-muted/50" />
                </div>
                <div className="h-8 w-full animate-pulse rounded-lg bg-muted/40" />
              </div>
              <div>
                <div className="mb-2 h-4 w-24 animate-pulse rounded bg-muted-foreground/12" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="mb-1 flex items-center justify-between rounded p-2">
                    <div className="h-4 w-24 animate-pulse rounded bg-muted-foreground/10" />
                    <div className="h-4 w-6 animate-pulse rounded bg-muted-foreground/10" />
                  </div>
                ))}
              </div>
              <div className="h-10 w-full animate-pulse rounded-md border border-input bg-muted/40" />
              <div className="h-[280px] w-full animate-pulse rounded-lg border border-border bg-muted" />
            </div>
          </div>

          <div className="lg:w-3/4">
            <HotelSearchResultSkeleton rows={5} variant="list" />
          </div>
        </div>
      </div>
    </div>
  );
}
