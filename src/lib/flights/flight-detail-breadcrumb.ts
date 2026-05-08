import type { FlightListDisplay } from "@/lib/flights/list-display";

/** Breadcrumb crumb (short route) vs hero `h1` (airline + flight number + route). */
export function buildFlightDetailBreadcrumbLabels(flight: FlightListDisplay): {
  route: string;
  title: string;
} {
  const route = `${flight.fromCode} → ${flight.toCode}`;
  const airline = flight.airlineName ?? flight.airline;
  const title = `${airline} ${flight.flightNumber} · ${flight.fromCode} → ${flight.toCode}`;
  return { route, title };
}
