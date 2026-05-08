"use client";

/** Initial grid skeleton for flight checkout (dynamic import + offer fetch). */
export function CheckoutLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 animate-pulse rounded-md bg-muted-foreground/20" />
          <div className="h-4 w-64 animate-pulse rounded bg-muted-foreground/15" />
        </div>
        <div className="h-4 w-28 animate-pulse rounded bg-muted-foreground/15" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="space-y-4 lg:col-span-2">
          <div className="min-h-[280px] rounded-2xl border border-border bg-card/60 p-6 shadow-sm md:p-8">
            <div className="mb-6 h-7 w-32 animate-pulse rounded-md bg-muted-foreground/20" />
            <div className="space-y-4">
              <div className="h-36 animate-pulse rounded-xl border border-border/60 bg-muted/40" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-12 animate-pulse rounded-lg bg-muted/50" />
                <div className="h-12 animate-pulse rounded-lg bg-muted/50" />
                <div className="h-12 animate-pulse rounded-lg bg-muted/50" />
                <div className="h-12 animate-pulse rounded-lg bg-muted/50" />
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="h-14 animate-pulse bg-muted" />
            <div className="space-y-4 p-6">
              <div className="h-5 w-3/4 animate-pulse rounded bg-muted-foreground/15" />
              <div className="h-4 w-full animate-pulse rounded bg-muted-foreground/10" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-muted/50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
