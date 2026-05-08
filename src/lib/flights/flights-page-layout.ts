import { flightSearchBodyFromUrl } from "@/lib/flights/search-from-url";

/** `/flights` without a runnable search → form + featured only (no list). */
export type FlightsPageLayout = "browse" | "results";

/**
 * - `browse`: default — `FlightsTab` + `FeaturedFlights`, `FlightList` not mounted (saves work).
 * - `results`: URL builds a valid `FlightSearchBody` — full column: tab → list → featured.
 */
export function getFlightsPageLayout(searchParams: URLSearchParams): FlightsPageLayout {
  return flightSearchBodyFromUrl(searchParams) != null ? "results" : "browse";
}

export function recordToUrlSearchParams(
  sp: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) qs.append(key, v);
    } else {
      qs.set(key, value);
    }
  }
  return qs;
}
