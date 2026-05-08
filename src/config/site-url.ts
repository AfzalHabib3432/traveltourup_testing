/**
 * Canonical site origin for metadata, sitemaps, and JSON-LD.
 * Prefer NEXT_PUBLIC_SITE_URL in production; falls back to NEXT_PUBLIC_APP_URL, VERCEL_URL, then a dev default.
 *
 * Ops: set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION / NEXT_PUBLIC_BING_SITE_VERIFICATION in deploy env;
 * bump NEXT_PUBLIC_SEO_STATIC_LASTMOD when static marketing copy changes materially.
 */
export function normalizeSiteUrl(raw: string): string {
  let u = raw.trim().replace(/\/$/, "");
  if (!u.startsWith("http://") && !u.startsWith("https://")) {
    u = `https://${u}`;
  }
  return u;
}

export function getSiteUrl(): string {
  const explicit =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.SITE_URL?.trim();
  if (explicit) {
    return normalizeSiteUrl(explicit);
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return normalizeSiteUrl(vercel.replace(/^https?:\/\//, ""));
  }

  return "https://traveltourup.com";
}
