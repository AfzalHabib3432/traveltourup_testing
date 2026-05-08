import "server-only";
import { duffelFetch } from "./client";

/** Duffel: `GET /places/suggestions` — cities and airports with coordinates (for Stays search). */
export function listDuffelPlaceSuggestions(params: { query: string; limit?: number }) {
  const q = new URLSearchParams();
  q.set("query", params.query.trim());
  q.set("limit", String(Math.min(30, Math.max(1, params.limit ?? 22))));
  return duffelFetch<unknown>(`/places/suggestions?${q.toString()}`, { method: "GET" });
}
