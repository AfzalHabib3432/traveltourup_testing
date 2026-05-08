/**
 * Curated routes for the marketing “Featured flights” strip.
 * IATA codes only — add/change here to control API cost (each route = one offer request when cache misses).
 */
export type FeaturedRoute = {
  origin: string;
  destination: string;
};

export const FEATURED_FLIGHT_ROUTES: FeaturedRoute[] = [
  { origin: "JFK", destination: "DXB" },
  { origin: "LHR", destination: "DOH" },
  { origin: "LHR", destination: "JFK" },
  { origin: "FRA", destination: "SIN" },
  { origin: "SIN", destination: "SYD" },
  { origin: "MIA", destination: "MAD" },
];

/** Days ahead for outbound (far enough to improve availability in test/live). */
export const FEATURED_DEPARTURE_OFFSET_DAYS = 21;

/** Next.js `unstable_cache` TTL (seconds). */
export const FEATURED_FLIGHTS_REVALIDATE_SECONDS = 600;
