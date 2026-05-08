"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { ArrowRight, Calendar, User } from "lucide-react";
import { motion } from "framer-motion";
import type { BlogPostDto } from "@/lib/blog/blog.types";
import { cn } from "@/lib/utils";

export function FeaturedPostBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute left-3 top-3 z-10 inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-black/45 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-white/95 shadow-lg backdrop-blur-md md:left-3.5 md:top-3.5 md:px-3 md:py-1.5 md:text-[0.65rem]",
        className,
      )}
      aria-label="Featured post"
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]"
        aria-hidden
      />
      Featured
    </span>
  );
}

function coerceDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

/** Listing cards — “08 Aug, 2023” layout; UTC calendar for stable RSC → client hydration. */
function formatBlogListDate(value: Date | string, locale: string): string {
  const d = coerceDate(value);
  const parts = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).formatToParts(d);
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  const year = parts.find((p) => p.type === "year")?.value ?? "";
  return `${day.padStart(2, "0")} ${month}, ${year}`;
}

function blogListDateIso(value: Date | string): string {
  const d = coerceDate(value);
  return d.toISOString().slice(0, 10);
}

const gridCardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.38,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

export function AnimatedBlogCard({
  blog,
  prefersReducedMotion,
}: {
  blog: BlogPostDto;
  prefersReducedMotion: boolean | null;
}) {
  const locale = useLocale();
  const coverAlt =
    blog.imageAlt?.trim() ? blog.imageAlt.trim() : `${blog.title} — cover`;
  const excerpt =
    blog.excerpt.trim().length > 0
      ? blog.excerpt.trim()
      : `${blog.readTime} min read · ${blog.category.name}`;

  return (
    <motion.article
      variants={prefersReducedMotion ? undefined : gridCardVariants}
      initial={prefersReducedMotion ? false : "hidden"}
      whileInView={prefersReducedMotion ? undefined : "show"}
      viewport={{ once: true, margin: "-32px" }}
      whileHover={
        prefersReducedMotion
          ? undefined
          : { y: -4, transition: { duration: 0.22 } }
      }
      whileTap={prefersReducedMotion ? undefined : { scale: 0.991 }}
      className="h-full"
    >
      <div
        className={cn(
          "group/card flex h-full min-h-0 flex-col gap-5 overflow-hidden rounded-xl border border-border/60 bg-card p-4 text-left shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] outline-none ring-offset-background transition-[box-shadow,border-color,transform]",
          "dark:border-border dark:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.45)]",
          "focus-visible:ring-2 focus-visible:ring-ring md:flex-row md:items-stretch md:gap-4 md:p-4",
        )}
      >
        <div className="relative h-auto md:h-full shrink-0 md:w-[44%] md:max-w-[44%]">
          <div
            className={cn(
              "relative aspect-[4/3] w-full h-full overflow-hidden rounded-xl bg-muted",
              "after:pointer-events-none after:absolute after:inset-0 after:rounded-xl after:ring-1 after:ring-inset after:ring-black/[0.06] dark:after:ring-white/[0.08]",
            )}
          >
            {blog.featured ? <FeaturedPostBadge /> : null}
            <Image
              src={blog.image}
              alt={coverAlt}
              fill
              quality={72}
              loading="lazy"
              className="object-cover transition-transform duration-500 ease-out group-hover/card:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 44vw"
            />
          </div>
        </div>

        <div className="flex min-h-[11rem] min-w-0 flex-1 flex-col justify-between gap-5 md:min-h-[12.5rem]">
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <User
                  className="h-3.5 w-3.5 shrink-0 opacity-80"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span className="truncate">{blog.author.name}</span>
              </span>
              <span
                className="hidden h-3 w-px shrink-0 bg-muted-foreground/30 sm:block"
                aria-hidden
              />
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <Calendar
                  className="h-3.5 w-3.5 shrink-0 opacity-80"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <time dateTime={blogListDateIso(blog.publishedAt)}>
                  {formatBlogListDate(blog.publishedAt, locale)}
                </time>
              </span>
            </div>
            <Link
              href={`/blog/${blog.slug}`}
              className="group-hover/card:text-primary"
            >
              <h2 className="text-balance text-lg font-bold leading-snug tracking-tight text-foreground transition-colors group-hover/card:text-primary md:text-xl">
                {blog.title}
              </h2>
            </Link>

            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground md:text-[0.9375rem]">
              {excerpt}
            </p>
          </div>
          <div className="flex justify-end">
            <Link
              href={`/blog/${blog.slug}`}
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-600"
            >
              Read more
              <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
