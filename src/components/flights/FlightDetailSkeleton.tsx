"use client";

import { DetailPageLayout } from "@/components/shared/DetailPageLayout";
import { BookingSidebarSkeleton } from "@/components/shared/BookingSidebar";

function FlightDetailMainSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="h-4 max-w-xl animate-pulse rounded bg-muted-foreground/15" />
      <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-8 w-32 animate-pulse rounded-md bg-muted-foreground/15" />
            <div className="h-4 w-48 animate-pulse rounded bg-muted-foreground/10" />
          </div>
          <div className="h-10 w-28 animate-pulse rounded-lg bg-muted-foreground/15" />
        </div>
        <div className="flex items-center justify-between gap-4 border-y border-border py-6">
          <div className="space-y-2 text-center">
            <div className="mx-auto h-8 w-20 animate-pulse rounded-md bg-muted-foreground/15" />
            <div className="mx-auto h-3 w-24 animate-pulse rounded bg-muted-foreground/10" />
          </div>
          <div className="flex flex-1 flex-col items-center px-2">
            <div className="mb-2 h-3 w-16 animate-pulse rounded bg-muted-foreground/10" />
            <div className="h-1 w-full max-w-[120px] rounded-full bg-muted" />
          </div>
          <div className="space-y-2 text-center">
            <div className="mx-auto h-8 w-20 animate-pulse rounded-md bg-muted-foreground/15" />
            <div className="mx-auto h-3 w-24 animate-pulse rounded bg-muted-foreground/10" />
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-3 rounded-lg border border-border/60 p-3">
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-muted/60" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3 w-20 animate-pulse rounded bg-muted-foreground/15" />
                <div className="h-4 w-full animate-pulse rounded bg-muted-foreground/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ReviewsSectionSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm" aria-hidden>
      <div className="mb-6 h-8 max-w-xs animate-pulse rounded-md bg-muted-foreground/15" />
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="border-b border-border pb-4 last:border-0">
            <div className="mb-2 flex gap-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted-foreground/15" />
              <div className="h-4 w-16 animate-pulse rounded bg-muted-foreground/10" />
            </div>
            <div className="h-3 w-full animate-pulse rounded bg-muted-foreground/10" />
            <div className="mt-2 h-3 max-w-[95%] animate-pulse rounded bg-muted-foreground/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Full flight detail layout skeleton (main + sidebar + reviews) while the offer loads. */
export function FlightDetailLoading() {
  return (
    <div role="status" aria-live="polite" aria-label="Loading flight details">
      <DetailPageLayout
        mainContent={<FlightDetailMainSkeleton />}
        sidebarContent={<BookingSidebarSkeleton />}
        bottomContent={<ReviewsSectionSkeleton />}
      />
    </div>
  );
}
