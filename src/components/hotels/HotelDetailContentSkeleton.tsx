"use client";

import React from "react";
import { MapPin } from "lucide-react";

/**
 * Mirrors {@link HotelDetailContent} section order, spacing, and breakpoints
 * so stays loading state matches the hydrated UI.
 */
export function HotelDetailContentSkeleton() {
  return (
    <div className="space-y-8" aria-hidden>
      {/* Header — countdown banner + title + meta + address */}
      <div>
        <div>
          <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2">
            <div className="h-4 w-full max-w-md animate-pulse rounded bg-muted-foreground/20" />
          </div>
        </div>
        <div className="mb-2 h-8 w-[min(100%,28rem)] animate-pulse rounded-md bg-muted-foreground/20 md:h-9" />
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-4 w-48 max-w-full animate-pulse rounded bg-muted-foreground/15" />
          <div className="h-7 w-24 animate-pulse rounded-lg bg-amber-400/40" />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-muted-foreground/30" aria-hidden />
          <div className="h-4 w-[min(100%,20rem)] animate-pulse rounded bg-muted-foreground/15" />
        </div>
      </div>

      {/* Image gallery — matches ImageGallery: hero + thumbnail strip */}
      <div className="space-y-3">
        <div className="relative aspect-[16/10] w-full animate-pulse rounded-xl bg-muted md:aspect-[21/9]" />
        <div className="flex gap-2 overflow-hidden pb-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-14 w-20 shrink-0 animate-pulse rounded-lg bg-muted md:h-16 md:w-24"
            />
          ))}
        </div>
      </div>

      {/* Key details — DetailKeyGrid columns */}
      <div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-primary/10" />
              <div className="min-w-0 flex-1 space-y-2 pt-0.5">
                <div className="h-3.5 w-24 animate-pulse rounded bg-muted-foreground/20" />
                <div className="h-3.5 w-full max-w-[12rem] animate-pulse rounded bg-muted-foreground/12" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="border-t border-border pt-8">
        <div className="mb-4 h-7 w-56 max-w-full animate-pulse rounded-md bg-muted-foreground/20" />
        <div className="space-y-2">
          <div className="h-3.5 w-full animate-pulse rounded bg-muted-foreground/12" />
          <div className="h-3.5 w-full animate-pulse rounded bg-muted-foreground/12" />
          <div className="h-3.5 w-[95%] max-w-3xl animate-pulse rounded bg-muted-foreground/12" />
          <div className="h-3.5 w-[80%] max-w-2xl animate-pulse rounded bg-muted-foreground/12" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="h-3.5 w-28 animate-pulse rounded bg-muted-foreground/10" />
          <div className="h-3.5 w-1 animate-pulse rounded bg-transparent" />
          <div className="h-3.5 w-32 animate-pulse rounded bg-muted-foreground/10" />
        </div>
      </div>

      {/* Available rooms — section + rate cards */}
      <div className="border-t border-border pt-8">
        <div className="mb-6 space-y-2">
          <div className="h-7 w-64 max-w-full animate-pulse rounded-md bg-muted-foreground/20" />
          <div className="h-3.5 w-full max-w-2xl animate-pulse rounded bg-muted-foreground/12" />
          <div className="h-3.5 w-full max-w-xl animate-pulse rounded bg-muted-foreground/12" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border-2 border-border bg-card sm:rounded-xl"
            >
              <div className="flex min-h-[128px] w-full min-w-0 flex-row sm:min-h-[200px] lg:items-stretch">
                <div className="h-[128px] w-[40%] min-w-24 max-w-[44%] shrink-0 animate-pulse bg-muted sm:h-[200px] sm:w-[35%] lg:h-auto lg:min-h-[200px]" />
                <div className="flex min-w-0 flex-1 flex-col gap-2 p-1.5 sm:gap-3 sm:p-4">
                  <div className="flex justify-between gap-2">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-5 w-3/4 max-w-sm animate-pulse rounded bg-muted-foreground/18 sm:h-6" />
                      <div className="h-3 w-40 max-w-full animate-pulse rounded bg-muted-foreground/12" />
                      <div className="h-3 w-32 animate-pulse rounded bg-muted-foreground/10" />
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <div className="h-6 w-20 animate-pulse rounded bg-muted-foreground/15" />
                      <div className="h-9 w-24 animate-pulse rounded-lg bg-primary/20" />
                    </div>
                  </div>
                  <div className="mt-auto hidden gap-2 sm:flex">
                    <div className="h-3 flex-1 animate-pulse rounded bg-muted-foreground/10" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Amenities — DetailFeaturesGrid */}
      <div className="border-t border-border pt-8">
        <div className="mb-2 h-7 w-48 max-w-full animate-pulse rounded-md bg-muted-foreground/20" />
        <div className="mb-4 h-3.5 w-full max-w-lg animate-pulse rounded bg-muted-foreground/12" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg bg-muted/30 p-2">
              <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-primary/10" />
              <div className="h-3.5 min-w-0 flex-1 animate-pulse rounded bg-muted-foreground/15" />
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="border-t border-border pt-8">
        <div className="mb-4 h-7 w-40 animate-pulse rounded-md bg-muted-foreground/20" />
        <div className="h-[280px] w-full animate-pulse rounded-xl border border-border bg-muted" />
      </div>
    </div>
  );
}
