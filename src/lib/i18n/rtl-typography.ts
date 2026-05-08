import { cn } from "@/lib/utils";

import { isRtlLocale } from "./rtl";

/**
 * Classes for headings/body copy only — keeps cards, grids, and chrome LTR.
 * Uses isolate bidi so embedded Latin/digits behave predictably.
 */
export function rtlTypographyClass(locale: string, extra?: string): string {
  if (!isRtlLocale(locale)) return cn(extra);
  /* !text-start beats inherited text-center from ancestors (e.g. text-center lg:text-left). */
  return cn("[unicode-bidi:isolate] !text-start", extra);
}

export function rtlDirProp(locale: string): "rtl" | undefined {
  return isRtlLocale(locale) ? "rtl" : undefined;
}
