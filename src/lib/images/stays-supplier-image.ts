/**
 * Stays supplier CDNs often 404 or block Next.js `/_next/image` fetches; the browser can load the same URL.
 */
export function shouldUnoptimizeStaysSupplierImage(src: string): boolean {
  if (!src || typeof src !== "string") return false;
  try {
    const { hostname } = new URL(src);
    const h = hostname.toLowerCase();
    return (
      h.endsWith(".bstatic.com") ||
      h.endsWith(".bstatic.net") ||
      h.endsWith(".agoda.net") ||
      h === "mobileimg.priceline.com"
    );
  } catch {
    return false;
  }
}
