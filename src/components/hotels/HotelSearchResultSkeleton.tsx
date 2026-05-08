"use client";

import { Skeleton } from "@/components/admin_ui/ui/skeleton";

/** Mirrors list `HotelCard` in HotelsList: image | details | CTA column. */
function HotelListCardSkeleton() {
  return (
    <div
      className="mb-4 rounded-xl border border-border bg-card p-6 shadow-md"
      aria-hidden
    >
      <div className="flex flex-col lg:flex-row">
        <div className="mb-4 lg:mb-0 lg:w-1/4 lg:pr-6">
          <Skeleton className="relative h-48 w-full rounded-lg lg:h-40" />
          <div className="mt-3 flex items-center justify-between">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
        <div className="lg:w-2/4 lg:pr-6">
          <div className="mb-3 flex items-start justify-between gap-2">
            <Skeleton className="h-7 w-3/4 max-w-md" />
            <div className="flex shrink-0 gap-2">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-9 w-9 rounded" />
              <Skeleton className="h-9 w-9 rounded" />
            </div>
          </div>
          <Skeleton className="mb-2 h-4 w-full max-w-lg" />
          <Skeleton className="mb-2 h-4 w-4/5 max-w-md" />
          <Skeleton className="mb-4 h-4 w-full max-w-2xl" />
          <div className="mb-4 flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20 rounded-md" />
            <Skeleton className="h-6 w-24 rounded-md" />
          </div>
          <Skeleton className="mb-2 h-3 w-28" />
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <div className="mt-4 lg:mt-0 lg:w-1/4 lg:border-l lg:border-border lg:pl-6">
          <div className="mb-4">
            <Skeleton className="mb-2 h-8 w-36" />
            <Skeleton className="h-3 w-44" />
          </div>
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/** Mirrors grid `HotelCard` in HotelsList. */
function HotelGridCardSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-md" aria-hidden>
      <Skeleton className="mb-3 h-36 w-full rounded-lg" />
      <Skeleton className="mb-2 h-5 w-full" />
      <Skeleton className="mb-3 h-4 w-4/5" />
      <div className="mb-3 flex justify-between">
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
      <div className="mt-auto border-t border-border pt-3">
        <Skeleton className="mb-2 h-7 w-32" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function HotelSearchResultSkeleton({
  rows = 5,
  variant = "list",
}: {
  rows?: number;
  variant?: "list" | "grid";
}) {
  return (
    <div
      className="w-full"
      role="status"
      aria-live="polite"
      aria-label="Loading hotel search results"
    >
      {variant === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: rows }, (_, i) => (
            <HotelGridCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        Array.from({ length: rows }, (_, i) => <HotelListCardSkeleton key={i} />)
      )}
    </div>
  );
}
