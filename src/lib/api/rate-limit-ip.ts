import "server-only";

type Bucket = { count: number; windowStart: number };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;

/**
 * Simple fixed-window rate limiter by key (e.g. client IP).
 * Suitable for single Node/edge instance; for multi-instance use Redis later (P5).
 */
export function rateLimitByKey(
  key: string,
  max: number,
  windowMs: number = WINDOW_MS,
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || now - b.windowStart >= windowMs) {
    b = { count: 0, windowStart: now };
    buckets.set(key, b);
  }
  if (b.count >= max) {
    const retryAfterSec = Math.ceil((windowMs - (now - b.windowStart)) / 1000);
    return { ok: false, retryAfterSec: Math.max(1, retryAfterSec) };
  }
  b.count += 1;
  return { ok: true };
}

export function clientIpFromHeaders(getter: (name: string) => string | null): string {
  const forwarded = getter("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  const realIp = getter("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}
