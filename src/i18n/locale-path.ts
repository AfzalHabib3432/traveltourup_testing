import { locales, defaultLocale, type AppLocale } from "@/i18n/routing";

const localeSet = new Set<string>(locales);

/** First segment if it is a configured locale; otherwise null. */
export function pathnameStartsWithLocale(pathname: string): AppLocale | null {
  const seg = pathname.split("/").filter(Boolean)[0];
  if (!seg) return null;
  return localeSet.has(seg) ? (seg as AppLocale) : null;
}

/**
 * Strip leading `/[locale]` when present.
 * `/en/login` → `/login`; `/admin` → `/admin`.
 */
export function stripLocalePrefix(pathname: string): string {
  const seg = pathname.split("/").filter(Boolean)[0];
  if (seg && localeSet.has(seg)) {
    const rest = pathname.slice(seg.length + 1);
    return rest.startsWith("/") ? rest : `/${rest || ""}`;
  }
  return pathname.length === 0 ? "/" : pathname.startsWith("/") ? pathname : `/${pathname}`;
}

/** Resolved locale segment from pathname or default when absent (e.g. `/admin`). */
export function localeFromPathname(pathname: string): AppLocale {
  const seg = pathnameStartsWithLocale(pathname);
  return seg ?? defaultLocale;
}

/** Build a customer URL including locale prefix (e.g. `/en/flights?x=1`). */
export function localizedCustomerPath(locale: AppLocale, pathnameWithoutLocale: string): string {
  const [pathPart, ...rest] = pathnameWithoutLocale.split("?");
  const query = rest.length > 0 ? rest.join("?") : "";
  const p = pathPart.startsWith("/") ? pathPart : `/${pathPart}`;
  const base = p === "/" ? `/${locale}` : `/${locale}${p}`;
  return query ? `${base}?${query}` : base;
}
