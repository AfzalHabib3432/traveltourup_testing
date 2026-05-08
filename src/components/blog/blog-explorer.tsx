"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { ArrowRight, Search } from "lucide-react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/admin_ui/ui/skeleton";
import type { BlogPostDto } from "@/lib/blog/blog.types";
import { cn } from "@/lib/utils";
import {
  FeaturedPostBadge,
  AnimatedBlogCard,
} from "@/components/blog/blog-explorer-card";

type BlogExplorerFilter =
  | "All Posts"
  | "Luxury Travel"
  | "Budget Travel"
  | "Adventure";

const FILTERS: BlogExplorerFilter[] = [
  "All Posts",
  "Luxury Travel",
  "Budget Travel",
  "Adventure",
];

const HERO_ROTATE_MS = 6000;
const GRID_PAGE_SIZE = 10;

const getPostBucket = (
  blog: BlogPostDto,
): Exclude<BlogExplorerFilter, "All Posts"> => {
  const haystack = [
    blog.title,
    blog.excerpt,
    blog.category.name,
    blog.tags.join(" "),
  ]
    .join(" ")
    .toLowerCase();

  if (/(budget|saving|cheap|tips|packing)/.test(haystack))
    return "Budget Travel";
  if (
    /(adventure|solo|beach|guide|vacation|destination)/.test(haystack)
  )
    return "Adventure";
  return "Luxury Travel";
};

/** Featured hero with cross-fading cover images + link to the active story */
function RotatingHeroCard({ posts }: { posts: BlogPostDto[] }) {
  const prefersReducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const tBlog = useTranslations("Blog");

  const current = posts[index] ?? posts[0];

  useEffect(() => {
    if (posts.length <= 1 || prefersReducedMotion) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % posts.length);
    }, HERO_ROTATE_MS);
    return () => window.clearInterval(id);
  }, [posts.length, prefersReducedMotion]);

  if (!current) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured articles"
      className="overflow-hidden rounded-lg border border-border bg-card shadow-lg "
    >
      {/* col-reverse on mobile */}
      <div className="flex flex-col-reverse md:flex-row gap-2 md:gap-0">
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.id}
              role="tabpanel"
              aria-live={prefersReducedMotion ? "off" : "polite"}
              initial={
                prefersReducedMotion
                  ? false
                  : { opacity: 0, x: -12 }
              }
              animate={{ opacity: 1, x: 0 }}
              exit={
                prefersReducedMotion
                  ? undefined
                  : { opacity: 0, x: 16 }
              }
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="space-y-4"
            >
              <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-[2.35rem] lg:leading-tight">
                <span className="sr-only">{tBlog("featuredStoryLabel")}: </span>
                {current.title}
              </h2>
              <p className="max-w-xl text-muted-foreground md:text-lg">
                {current.excerpt.length > 220
                  ? `${current.excerpt.slice(0, 217)}…`
                  : current.excerpt}
              </p>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-end">
              <Link
                href={`/blog/${current.slug}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-600"
              >
                Read more
                <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
              </Link>
            </div>
          <div className="pt-6 border-t border-border">
            {posts.length > 1 ? (
              <div
                className="flex gap-1.5 justify-center"
                role="tablist"
                aria-label="Choose featured slide"
              >
                {posts.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    role="tab"
                    aria-selected={index === i}
                    aria-controls={`hero-panel-${p.id}`}
                    onClick={() => setIndex(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      index === i
                        ? "w-8 bg-primary"
                        : "w-1.5 bg-muted-foreground/35 hover:bg-muted-foreground/55",
                    )}
                  />
                ))}
              </div>
            ) : null}
            
          </div>
        </div>

        <div
          id={`hero-panel-${current.id}`}
          className=" min-h-[260px] overflow-hidden bg-transparent md:min-h-[320px] lg:min-h-[380px] md:flex-1"
        >
          <div className="relative aspect-[5/4] md:aspect-[16/9]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={current.id}
                initial={
                  prefersReducedMotion ? false : { opacity: 0, scale: 0.94, y: 12 }
                }
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={
                  prefersReducedMotion
                    ? undefined
                    : { opacity: 0, scale: 0.97, y: -10 }
                }
                transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="absolute inset-0 flex items-center justify-center p-4 md:p-6 lg:p-8 w-full h-full"
              >
                <div
                  className={cn(
                    "relative w-full h-full overflow-hidden rounded-2xl bg-transparent shadow-xl ring-1 ring-black/10 dark:ring-white/10",
                  )}
                >
                  {current.featured ? <FeaturedPostBadge /> : null}
                  <Image
                    src={current.image}
                    alt={
                      current.imageAlt?.trim() ? current.imageAlt : current.title
                    }
                    fill
                    sizes="(max-width: 768px) 280px, 380px"
                    quality={70}
                    priority
                    fetchPriority="high"
                    className="object-cover object-center w-full h-full"
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

export type BlogPostsExplorerProps = {
  posts: BlogPostDto[];
};

/** Loading UI aligned with {@link BlogPostsExplorer} (hero strip, toolbar, grid, pagination). */
export function BlogExplorerSkeleton() {
  return (
    <div
      className="min-h-screen bg-muted pb-16 pt-10 md:pb-20 md:pt-12"
      aria-busy="true"
      aria-label="Loading blog"
    >
      <span className="sr-only">Loading blog posts…</span>
      <div className="mx-auto container px-4 md:px-10">
        <div className="mb-10 md:mb-12">
          <section
            className="overflow-hidden rounded-lg border border-border bg-card shadow-lg"
            aria-hidden
          >
            <div className="grid gap-0 md:grid-cols-2">
              <div className="flex flex-col justify-between gap-10 p-8 md:p-10 lg:p-14">
                <div className="space-y-4">
                  <Skeleton className="h-9 w-full max-w-[28rem] md:h-11" />
                  <Skeleton className="h-9 w-full max-w-xl md:h-11" />
                  <Skeleton className="h-5 max-w-lg" />
                  <Skeleton className="h-5 max-w-md" />
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton
                      key={i}
                      className={cn(
                        "h-1.5 rounded-full opacity-90",
                        i === 3 ? "w-8" : "w-1.5",
                      )}
                    />
                  ))}
                </div>
                <div className="border-t border-border pt-6">
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
              <div className="relative min-h-[260px] md:min-h-[320px] lg:min-h-[380px]">
                <div className="absolute inset-0 flex items-center justify-center p-8 md:p-12">
                  <Skeleton className="-rotate-[3deg] aspect-[5/4] w-full max-w-[300px] rounded-2xl md:max-w-[340px] lg:max-w-[380px]" />
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <Skeleton
                key={f}
                className="h-9 w-[5.75rem] rounded-full sm:w-[6.75rem]"
              />
            ))}
          </div>
          <Skeleton className="h-11 w-full rounded-full lg:max-w-[320px]" />
        </div>

        <div
          className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-x-4 md:gap-y-4"
          aria-hidden
        >
          {Array.from({ length: GRID_PAGE_SIZE }, (_, idx) => (
            <div
              key={`sk-${idx}`}
              className="flex flex-col gap-5 overflow-hidden rounded-[1.5rem] border border-border/60 bg-card p-5 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] md:flex-row md:items-stretch md:gap-6 md:p-6"
            >
              <Skeleton className="aspect-[4/3] w-full shrink-0 rounded-xl md:w-[44%] md:max-w-[44%]" />
              <div className="flex min-h-[11rem] flex-1 flex-col justify-between gap-4 md:min-h-[12.5rem]">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-[72%]" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-[92%]" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[88%]" />
                </div>
                <Skeleton className="h-10 w-[8.5rem] rounded-lg" />
              </div>
            </div>
          ))}
        </div>

        <nav className="mt-12 flex flex-wrap justify-center gap-2" aria-hidden>
          <Skeleton className="h-10 w-[6.75rem] rounded-full" />
          {[1, 2, 3, 4, 5].map((p) => (
            <Skeleton key={p} className="h-10 w-10 rounded-full shrink-0" />
          ))}
          <Skeleton className="h-10 w-20 rounded-full" />
        </nav>
      </div>
    </div>
  );
}

export default function BlogPostsExplorer({ posts: blogs }: BlogPostsExplorerProps) {
  const tBlog = useTranslations("Blog");
  const [activeFilter, setActiveFilter] = useState<BlogExplorerFilter>(
    "All Posts",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const prefersReducedMotion = useReducedMotion();

  const visibleBlogs = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return blogs.filter((blog) => {
      const matchesFilter =
        activeFilter === "All Posts" ||
        getPostBucket(blog) === activeFilter;

      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          blog.title,
          blog.excerpt,
          blog.category.name,
          blog.tags.join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, blogs, searchTerm]);

  const heroPosts = useMemo(
    () => blogs.filter((b) => b.featured).slice(0, 6),
    [blogs]
  );
  const heroCarouselKey = useMemo(
    () => heroPosts.map((p) => p.id).join("|"),
    [heroPosts],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(visibleBlogs.length / GRID_PAGE_SIZE),
  );

  const displayPage = Math.min(currentPage, totalPages);

  const paginatedBlogs = useMemo(() => {
    const start = (displayPage - 1) * GRID_PAGE_SIZE;
    return visibleBlogs.slice(start, start + GRID_PAGE_SIZE);
  }, [displayPage, visibleBlogs]);

  const handleFilterChange = (filter: BlogExplorerFilter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-muted pb-16 pt-10 md:pb-20 md:pt-12 ">
      <div className="mx-auto container px-4 md:px-10">
        <header className="mb-8 md:mb-10">
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {tBlog("indexH1")}
          </h1>
        </header>
        <div className="mb-10 md:mb-12">
          {heroPosts.length > 0 ? (
            <RotatingHeroCard key={heroCarouselKey} posts={heroPosts} />
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center text-muted-foreground">
              No posts match your filters. Try another category or search.
            </div>
          )}
        </div>

        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Categories">
            {FILTERS.map((filter) => (
              <button
                type="button"
                key={filter}
                onClick={() => handleFilterChange(filter)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  activeFilter === filter
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-foreground hover:bg-muted/80",
                )}
              >
                {filter}
              </button>
            ))}
          </div>
          <Input
            id="blog-search"
            type="text"
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleSearchChange(e.target.value)
            }
            placeholder="Search posts"
            wrapperClassName="w-full lg:w-[min(320px,100%)]"
            className="h-11 rounded-full border-border bg-card"
            suffix={
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            }
          />
        </div>

        {visibleBlogs.length > 0 ? (
          <>
            <motion.div
              layout
              className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-x-4 md:gap-y-4"
            >
              {paginatedBlogs.map((blog) => (
                <AnimatedBlogCard
                  key={blog.id}
                  blog={blog}
                  prefersReducedMotion={prefersReducedMotion}
                />
              ))}
            </motion.div>

            {totalPages > 1 ? (
              <nav
                className="mt-12 flex flex-wrap justify-center gap-2"
                aria-label="Pagination"
              >
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={displayPage === 1}
                  className="rounded-full border border-border bg-card px-5 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted/80 disabled:opacity-45"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      type="button"
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "flex h-10 min-w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                        displayPage === page
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "border border-border bg-card hover:bg-muted/80",
                      )}
                    >
                      {page}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={displayPage === totalPages}
                  className="rounded-full border border-border bg-card px-5 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted/80 disabled:opacity-45"
                >
                  Next
                </button>
              </nav>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
