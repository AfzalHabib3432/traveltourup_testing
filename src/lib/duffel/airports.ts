import "server-only";
import { duffelFetch } from "./client";

/**
 * Paginated list of airports (`GET /air/airports`).
 * **Duffel does not support free-text search on this endpoint** — only `iata_country_code`, `limit`, cursors.
 * For autocomplete by name, use {@link listDuffelPlaceSuggestions} in `@/lib/duffel/places`.
 */
export function listDuffelAirports(params: { iata_country_code?: string; limit?: number }) {
  const q = new URLSearchParams();
  if (params.iata_country_code?.trim()) {
    q.set("iata_country_code", params.iata_country_code.trim());
  }
  q.set("limit", String(Math.min(30, Math.max(1, params.limit ?? 20))));
  return duffelFetch<unknown>(`/air/airports?${q.toString()}`, { method: "GET" });
}
