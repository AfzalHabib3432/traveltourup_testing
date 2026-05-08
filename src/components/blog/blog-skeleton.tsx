/**
 * Route-level loading UI for marketing blog pages (matches layout of list + detail).
 * Used by `blog/loading.tsx` and `[slug]/loading.tsx` while RSC data resolves.
 */
import { Skeleton } from "@/components/admin_ui/ui/skeleton";
import { BlogExplorerSkeleton } from "@/components/blog/blog-explorer";

const postShell =
  "overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-b from-card/90 via-card/55 to-muted/25 " +
  "shadow-[0_2px_28px_-14px_rgba(15,23,42,0.22)] ring-1 ring-inset ring-white/5 " +
  "dark:from-card/55 dark:via-card/35 dark:to-card/20 dark:shadow-[0_4px_40px_-12px_rgba(0,0,0,0.55)] " +
  "sm:rounded-3xl";

const contentFrame =
  "relative mx-auto min-w-0 w-[92%] max-w-[1600px] px-0 sm:w-[88%] md:w-[80%] lg:w-[80%]";

export function BlogIndexRouteSkeleton() {
  return (
    <main className="min-h-screen bg-background">
      <BlogExplorerSkeleton />
    </main>
  );
}

export function BlogPostDetailRouteSkeleton() {
  return (
    <section
      className="relative overflow-x-clip bg-gradient-to-b from-background via-background to-muted/25 pb-16 pt-8 md:pb-20 md:pt-12"
      aria-busy="true"
      aria-label="Loading article"
    >
      <span className="sr-only">Loading article…</span>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary/[0.08] via-primary/[0.02] to-transparent dark:from-primary/15 dark:via-primary/5"
        aria-hidden
      />

      <div className={contentFrame}>
        <div className={postShell}>
          <header className="border-b border-border/40 px-6 py-6 sm:px-8 sm:py-7 md:px-10 md:py-8">
            <div className="mb-4 flex flex-wrap items-center gap-2.5">
              <Skeleton className="h-7 w-24 rounded-full" />
              <span className="h-1 w-1 shrink-0 rounded-full bg-border" aria-hidden />
              <Skeleton className="h-4 w-20" />
              <span className="h-1 w-1 shrink-0 rounded-full bg-border" aria-hidden />
              <Skeleton className="h-4 w-16" />
              <span className="h-1 w-1 shrink-0 rounded-full bg-border" aria-hidden />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-9 max-w-[min(100%,48rem)] rounded-lg sm:h-11" />
            <Skeleton className="mt-4 h-[1.125rem] max-w-[min(100%,42rem)] md:h-5" />
            <Skeleton className="mt-3 h-[1.125rem] max-w-[min(100%,34rem)] md:h-5" />
          </header>

          <div className="border-b border-border/30 bg-muted/10">
            <Skeleton className="h-[min(44vh,380px)] w-full rounded-none sm:h-[min(52vh,480px)] md:h-[min(58vh,560px)]" />
          </div>

          <div className="border-t border-border/25 px-6 py-8 sm:px-8 sm:py-9 md:px-10 md:py-10">
            <div className="mb-5 flex items-center gap-3 sm:mb-6">
              <Skeleton className="h-9 w-9 shrink-0 rounded-xl sm:h-10 sm:w-10" />
              <div className="space-y-2">
                <Skeleton className="h-[0.7rem] w-20 uppercase" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>

            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 max-w-[93%]" />
              <Skeleton className="mt-10 h-[1.875rem] max-w-[min(85%,24rem)] sm:h-[2rem]" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 max-w-[96%]" />
              <Skeleton className="h-4 max-w-[88%]" />
              <Skeleton className="mt-8 h-6 max-w-[min(80%,22rem)] sm:h-7" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 max-w-[92%]" />
            </div>
          </div>

          <div className="border-t border-border/40 bg-gradient-to-b from-muted/20 to-transparent px-6 py-8 sm:px-8 sm:py-9 md:px-10">
            <div className="relative flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
              <div className="flex min-w-0 flex-1 flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
                <Skeleton className="h-[4.5rem] w-[4.5rem] shrink-0 rounded-full sm:h-[5.25rem] sm:w-[5.25rem]" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-3 w-36 max-w-full" />
                  <Skeleton className="h-8 w-52 max-w-full sm:h-10" />
                  <Skeleton className="h-4 w-64 max-w-full sm:h-[1.125rem]" />
                </div>
              </div>
              <div className="min-w-0 flex-1 space-y-3 border-t border-border/50 pt-6 lg:max-w-[min(100%,32rem)] lg:border-t-0 lg:pt-0 xl:max-w-[40%]">
                <Skeleton className="h-3 w-24 max-w-full" />
                <div className="flex flex-wrap gap-2.5 sm:gap-3">
                  <Skeleton className="h-10 w-24 rounded-full" />
                  <Skeleton className="h-10 w-28 rounded-full" />
                  <Skeleton className="h-10 w-20 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
