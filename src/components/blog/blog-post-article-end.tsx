import { Sparkles, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export type BlogPostArticleEndProps = {
  authorName: string;
  updatedAt: Date;
  tags: string[];
  categoryName: string;
  /** Renders as a section inside a parent card (no separate bordered card). */
  variant?: "card" | "embedded";
};

function authorInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]!}${parts[parts.length - 1]![0]!}`.toUpperCase();
}

export function BlogPostArticleEnd({
  authorName,
  updatedAt,
  tags,
  categoryName,
  variant = "card",
}: BlogPostArticleEndProps) {
  const embedded = variant === "embedded";

  const inner = (
    <div
      className={cn(
        "relative flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10",
        embedded ? "px-0 py-0" : "p-6 sm:p-8 md:p-10"
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
        <div className="relative shrink-0">
          <div
            className={cn(
              "absolute -inset-0.5 rounded-full bg-gradient-to-br from-primary via-primary/60 to-primary/30",
              "opacity-90 blur-[1px]"
            )}
            aria-hidden
          />
          <div
            className={cn(
              "relative flex h-[4.5rem] w-[4.5rem] items-center justify-center sm:h-[5.25rem] sm:w-[5.25rem]",
              "rounded-full bg-gradient-to-br from-card to-muted/80",
              "text-xl font-bold tracking-tight text-primary",
              "shadow-lg ring-2 ring-background"
            )}
            aria-hidden
          >
            {authorInitials(authorName)}
          </div>
        </div>

        <div className="min-w-0 space-y-2">
          <p className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.28em] text-primary/90">
            <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
            About the author
          </p>
          <p className="font-[family-name:var(--heading-font)] text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {authorName}
          </p>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            <span className="font-medium text-foreground/85">{categoryName}</span>
            <span className="mx-2 text-border">·</span>
            Updated{" "}
            <time
              className="tabular-nums text-foreground/75"
              dateTime={updatedAt.toISOString()}
            >
              {updatedAt.toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </p>
        </div>
      </div>

      {tags.length > 0 ? (
        <>
          <div
            className="hidden h-24 w-px shrink-0 bg-gradient-to-b from-transparent via-border to-transparent lg:block"
            aria-hidden
          />
          <div className="min-w-0 flex-1 border-t border-border/50 pt-6 lg:max-w-[min(100%,32rem)] lg:border-t-0 lg:pt-0 xl:max-w-[40%]">
            <p className="mb-3 flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.28em] text-muted-foreground">
              <Tag className="h-3.5 w-3.5 text-primary" aria-hidden />
              Topics
            </p>
            <ul className="flex flex-wrap gap-2.5 sm:gap-3">
              {tags.map((tag) => (
                <li key={tag}>
                  <span
                    className={cn(
                      "inline-flex max-w-full items-center rounded-full border border-primary/20",
                      "bg-background/60 px-4 py-2 text-sm font-medium text-foreground/95",
                      "shadow-sm backdrop-blur-sm",
                      "transition duration-200 hover:-translate-y-0.5 hover:border-primary/45 hover:bg-primary/8 hover:shadow-md",
                      embedded && "bg-muted/30"
                    )}
                  >
                    #{tag}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}
    </div>
  );

  if (embedded) {
    return (
      <div className="border-t border-border/40 bg-gradient-to-b from-muted/20 to-transparent px-6 py-8 sm:px-8 sm:py-9 md:px-10">
        {inner}
      </div>
    );
  }

  return (
    <div className="mt-12 sm:mt-14">
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border/45",
          "bg-gradient-to-br from-primary/[0.08] via-card/90 to-muted/40",
          "shadow-[0_8px_40px_-16px_rgba(15,23,42,0.25)] ring-1 ring-inset ring-white/[0.06]",
          "dark:from-primary/10 dark:via-card/40 dark:to-background/80 dark:shadow-[0_12px_48px_-12px_rgba(0,0,0,0.55)]",
          "sm:rounded-3xl"
        )}
      >
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-cyan-500/5 blur-3xl dark:bg-cyan-500/10"
          aria-hidden
        />
        {inner}
        <div className="border-t border-border/40 bg-gradient-to-r from-primary/10 via-transparent to-primary/5 px-6 py-3.5 sm:px-8">
          <div className="h-0.5 w-32 max-w-full rounded-full bg-gradient-to-r from-primary to-primary/5" />
        </div>
      </div>
    </div>
  );
}
