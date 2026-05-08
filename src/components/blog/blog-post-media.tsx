"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import type { BlogPostImageDto } from "@/lib/blog/blog.types";
import { cn } from "@/lib/utils";

export type BlogPostMediaProps = {
  cover: BlogPostImageDto | null;
  rest: BlogPostImageDto[];
  postTitle: string;
  /** Edge-to-edge gallery (e.g. blog detail with full-bleed strip). */
  fullWidth?: boolean;
  /** Inside a parent card: no outer margin, flat edges, spacing for inlay. */
  embedded?: boolean;
};

function orderedImages(
  cover: BlogPostImageDto | null,
  rest: BlogPostImageDto[]
): BlogPostImageDto[] {
  if (cover) return [cover, ...rest];
  return rest;
}

export function BlogPostMedia({
  cover,
  rest,
  postTitle,
  fullWidth = false,
  embedded = false,
}: BlogPostMediaProps) {
  const all = useMemo(() => orderedImages(cover, rest), [cover, rest]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const count = all.length;

  const close = useCallback(() => setOpenIndex(null), []);
  const goPrev = useCallback(() => {
    setOpenIndex((i) => {
      if (i === null || count < 2) return i;
      return (i - 1 + count) % count;
    });
  }, [count]);
  const goNext = useCallback(() => {
    setOpenIndex((i) => {
      if (i === null || count < 2) return i;
      return (i + 1) % count;
    });
  }, [count]);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openIndex, close, goPrev, goNext]);

  useEffect(() => {
    if (openIndex === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [openIndex]);

  if (count === 0) return null;

  const caption = (index: number) => {
    if (index === 0 && cover) return postTitle;
    const img = all[index];
    const alt = img.alt?.trim();
    if (alt) return alt;
    return `Photo ${index + 1}`;
  };

  const open = openIndex !== null && all[openIndex] ? all[openIndex] : null;

  const flush = fullWidth || embedded;

  return (
    <div
      className={cn(
        "space-y-0",
        !fullWidth && !embedded && "mb-10 space-y-4",
        embedded && "space-y-3"
      )}
    >
      {cover ? (
        <button
          type="button"
          onClick={() => setOpenIndex(0)}
          className={cn(
            "group relative w-full cursor-zoom-in overflow-hidden text-left transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            flush
              ? "rounded-none ring-0"
              : "mb-0 rounded-2xl ring-1 ring-border/40"
          )}
          aria-label={`Open full image: ${postTitle}`}
        >
          <img
            src={cover.url}
            alt={cover.alt}
            className={cn(
              "w-full object-cover transition duration-700 ease-out group-hover:scale-[1.03]",
              fullWidth
                ? "h-[min(48vh,420px)] sm:h-[min(56vh,520px)] md:h-[min(65vh,640px)]"
                : embedded
                  ? "h-[min(44vh,380px)] sm:h-[min(52vh,480px)] md:h-[min(58vh,560px)]"
                  : "h-[280px] md:h-[min(60vh,520px)]"
            )}
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_20%_100%,rgba(0,0,0,0.5),transparent)]"
            aria-hidden
          />
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 lg:p-12">
            <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white/95 shadow-lg backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
              Featured
            </span>
            <h2 className="max-w-3xl text-balance font-[family-name:var(--heading-font)] text-2xl font-bold leading-[1.12] tracking-tight text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.5)] sm:text-3xl md:text-4xl md:leading-tight">
              {postTitle}
            </h2>
            <span className="mt-4 inline-flex items-center gap-2 rounded-md text-sm font-medium text-white/85 transition group-hover:text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-md border border-white/20 bg-white/10 text-white/90 backdrop-blur-sm transition group-hover:bg-white/20">
                <Maximize2 className="h-3.5 w-3.5" aria-hidden />
              </span>
              View full size
            </span>
          </div>
        </button>
      ) : null}

      {rest.length > 0 ? (
        <div
          className={cn(
            "mx-auto w-full",
            rest.length === 1
              ? "max-w-xs sm:max-w-sm md:max-w-md"
              : "max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl"
          )}
        >
          <div
            className={cn(
              "grid",
              fullWidth
                ? cn(
                    "gap-px bg-border/40",
                    rest.length === 1 ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3"
                  )
                : embedded
                  ? cn(
                      "gap-1.5 sm:gap-2",
                      rest.length === 1 ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3"
                    )
                  : cn(
                      "gap-2.5",
                      rest.length === 1 ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3"
                    )
            )}
          >
            {rest.map((img, j) => {
              const indexInAll = (cover ? 1 : 0) + j;
              const label =
                img.alt?.trim() || (cover ? `Gallery · ${j + 1}` : `Photo ${j + 1}`);
              return (
                <button
                  type="button"
                  key={img.id}
                  onClick={() => setOpenIndex(indexInAll)}
                  className={cn(
                    "group relative aspect-[16/9] w-full min-h-0 cursor-zoom-in overflow-hidden bg-background text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    fullWidth
                      ? "rounded-none border-0 ring-0 ring-inset group-hover:ring-2 group-hover:ring-primary/25"
                      : embedded
                        ? "rounded-md border border-border/50 ring-0 shadow-sm group-hover:shadow-md sm:rounded-lg"
                        : "rounded-lg border border-border/60 ring-0 shadow-sm group-hover:shadow-md"
                  )}
                  aria-label={`Open full image: ${label}`}
                >
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/0 opacity-90 transition duration-300 group-hover:opacity-100"
                    aria-hidden
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-2.5">
                    <p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-white/50">
                      Gallery
                    </p>
                    <p className="line-clamp-2 text-pretty font-[family-name:var(--heading-font)] text-xs font-semibold leading-tight text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.6)] sm:text-sm">
                      {label}
                    </p>
                  </div>
                  <div className="absolute right-1.5 top-1.5 rounded-md border border-white/25 bg-black/40 p-1 text-white/95 shadow-lg backdrop-blur-sm transition group-hover:scale-105 group-hover:bg-black/60 sm:right-2 sm:top-2 sm:p-1.5">
                    <Maximize2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {open && openIndex !== null ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          <div
            className="absolute inset-0 bg-black/88 backdrop-blur-sm"
            onClick={close}
            aria-hidden
          />
          <div
            className="relative z-10 flex max-h-[100dvh] w-full max-w-5xl flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex w-full max-w-4xl items-start justify-between gap-3 px-1">
              <p className="line-clamp-2 text-balance text-center text-sm font-medium text-white/95 sm:text-left sm:text-base">
                {caption(openIndex)}
              </p>
              <button
                type="button"
                onClick={close}
                className="shrink-0 rounded-lg border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative flex min-h-0 w-full max-w-4xl flex-1 items-center justify-center">
              {count > 1 ? (
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-0 z-20 rounded-full border border-white/20 bg-black/50 p-2.5 text-white transition hover:bg-black/70 sm:-left-2 md:-left-12"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              ) : null}
              <img
                src={open.url}
                alt={open.alt}
                className="max-h-[min(85dvh,900px)] w-full max-w-full object-contain"
              />
              {count > 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-0 z-20 rounded-full border border-white/20 bg-black/50 p-2.5 text-white transition hover:bg-black/70 sm:-right-2 md:-right-12"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              ) : null}
            </div>
            {count > 1 ? (
              <p className="mt-3 text-sm tabular-nums text-white/70">
                {openIndex + 1} / {count}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
