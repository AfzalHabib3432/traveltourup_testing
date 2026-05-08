import {
  cabinClassToDuffel,
  type FlightSearchBody,
} from "@/lib/validations/flights.schema";
import { passengersFromCounts, passengersFromCountsAndChildAges } from "@/lib/flights/passengers";
import {
  mergeSliceTimeWindowsFromUrl,
  parseChildAgesFromUrl,
} from "@/lib/flights/search-url-extras";

const DUFFEL_CABINS = ["economy", "premium_economy", "business", "first"] as const;
type DuffelCabin = (typeof DUFFEL_CABINS)[number];

function normalizeCabinFromUrl(raw: string): DuffelCabin {
  if ((DUFFEL_CABINS as readonly string[]).includes(raw)) return raw as DuffelCabin;
  const mapped = cabinClassToDuffel(raw);
  return (DUFFEL_CABINS as readonly string[]).includes(mapped) ? (mapped as DuffelCabin) : "economy";
}

const SORTS = ["best", "price_asc", "price_desc", "duration_asc", "duration_desc"] as const;

function passengersForUrl(
  sp: URLSearchParams,
  adults: number,
  children: number,
  infants: number,
): FlightSearchBody["passengers"] {
  const ages = parseChildAgesFromUrl(sp);
  if (children > 0 && ages.length > 0) {
    return passengersFromCountsAndChildAges({ adults, children, infants }, ages);
  }
  return passengersFromCounts({ adults, children, infants });
}

function optionalConnectionsAndTimeout(sp: URLSearchParams): Pick<
  FlightSearchBody,
  "max_connections" | "supplier_timeout_ms"
> {
  const maxConnRaw = sp.get("max_connections");
  const max_connections =
    maxConnRaw != null ? parseInt(maxConnRaw, 10) : undefined;
  const stRaw = sp.get("supplier_timeout");
  const supplier_timeout_ms = stRaw != null ? parseInt(stRaw, 10) : undefined;
  const out: Pick<FlightSearchBody, "max_connections" | "supplier_timeout_ms"> = {};
  if (max_connections != null && !Number.isNaN(max_connections)) {
    out.max_connections = Math.min(2, Math.max(0, max_connections));
  }
  if (supplier_timeout_ms != null && !Number.isNaN(supplier_timeout_ms)) {
    out.supplier_timeout_ms = Math.min(120_000, Math.max(1000, supplier_timeout_ms));
  }
  return out;
}

/**
 * Build `FlightSearchBody` from `/flights` URL search params (P1 MVP: one_way + round_trip).
 * Optional `slices` JSON array for multi-city (same shape as API body slices).
 */
export function flightSearchBodyFromUrl(searchParams: URLSearchParams): FlightSearchBody | null {
  const multiSlices = searchParams.get("slices");
  if (multiSlices) {
    try {
      let slices = JSON.parse(multiSlices) as FlightSearchBody["slices"];
      if (!Array.isArray(slices) || slices.length < 1) return null;
      slices = mergeSliceTimeWindowsFromUrl(slices, searchParams);
      const adults = Math.max(1, parseInt(searchParams.get("adults") ?? "1", 10) || 1);
      const children = Math.max(0, parseInt(searchParams.get("children") ?? "0", 10) || 0);
      const infants = Math.max(0, parseInt(searchParams.get("infants") ?? "0", 10) || 0);
      const cabin = normalizeCabinFromUrl(searchParams.get("cabin_class") ?? "economy");
      const sortRaw = searchParams.get("sort");
      const sort = SORTS.includes(sortRaw as (typeof SORTS)[number])
        ? (sortRaw as FlightSearchBody["sort"])
        : "best";
      const maxPrice = searchParams.get("max_price") ?? undefined;
      const maxStopsRaw = searchParams.get("max_stops");
      const maxStops = maxStopsRaw != null ? parseInt(maxStopsRaw, 10) : undefined;
      const carriers = searchParams.getAll("carrier_iata").map((c) => c.trim().toUpperCase()).filter(Boolean);

      return {
        slices,
        passengers: passengersForUrl(searchParams, adults, children, infants),
        cabin_class: cabin,
        sort,
        limit: Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "30", 10) || 30)),
        ...optionalConnectionsAndTimeout(searchParams),
        ...(maxPrice ? { max_price: maxPrice } : {}),
        ...(maxStops != null && !Number.isNaN(maxStops) ? { max_stops: maxStops } : {}),
        ...(carriers.length ? { carrier_iata: carriers } : {}),
      };
    } catch {
      return null;
    }
  }

  const origin = searchParams.get("origin")?.trim().toUpperCase();
  const destination = searchParams.get("destination")?.trim().toUpperCase();
  const departureDate = searchParams.get("departure_date")?.trim();
  const returnDate = searchParams.get("return_date")?.trim();
  const trip = searchParams.get("trip") ?? "one_way";

  if (!origin || !destination || !departureDate) return null;

  let slices: FlightSearchBody["slices"] =
    trip === "round_trip" && returnDate
      ? [
          { origin, destination, departure_date: departureDate },
          { origin: destination, destination: origin, departure_date: returnDate },
        ]
      : [{ origin, destination, departure_date: departureDate }];

  slices = mergeSliceTimeWindowsFromUrl(slices, searchParams);

  const adults = Math.max(1, parseInt(searchParams.get("adults") ?? "1", 10) || 1);
  const children = Math.max(0, parseInt(searchParams.get("children") ?? "0", 10) || 0);
  const infants = Math.max(0, parseInt(searchParams.get("infants") ?? "0", 10) || 0);

  const cabin = normalizeCabinFromUrl(searchParams.get("cabin_class") ?? "economy");

  const sortRaw = searchParams.get("sort");
  const sort = SORTS.includes(sortRaw as (typeof SORTS)[number])
    ? (sortRaw as FlightSearchBody["sort"])
    : "best";
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "30", 10) || 30));

  const maxPrice = searchParams.get("max_price") ?? undefined;
  const maxStopsRaw = searchParams.get("max_stops");
  const maxStops = maxStopsRaw != null ? parseInt(maxStopsRaw, 10) : undefined;

  const carriers = searchParams.getAll("carrier_iata").map((c) => c.trim().toUpperCase()).filter(Boolean);

  return {
    slices,
    passengers: passengersForUrl(searchParams, adults, children, infants),
    cabin_class: cabin,
    sort,
    limit,
    ...optionalConnectionsAndTimeout(searchParams),
    ...(maxPrice ? { max_price: maxPrice } : {}),
    ...(maxStops != null && !Number.isNaN(maxStops) ? { max_stops: maxStops } : {}),
    ...(carriers.length ? { carrier_iata: carriers } : {}),
  };
}

export function describeSearchRoute(sp: URLSearchParams): { title: string; subtitle: string } {
  const origin = sp.get("origin") ?? "—";
  const destination = sp.get("destination") ?? "—";
  const departureDate = sp.get("departure_date") ?? "";
  const adults = sp.get("adults") ?? "1";
  const cabin = sp.get("cabin_class") ?? "economy";
  return {
    title: `${origin} → ${destination}`,
    subtitle: `${departureDate} · ${adults} adult(s) · ${cabin.replace(/_/g, " ")}`,
  };
}

/** `one_way` | `round_trip` derived from URL (default one_way). */
export function tripTypeFromUrl(sp: URLSearchParams): "one_way" | "round_trip" {
  const trip = sp.get("trip") ?? "one_way";
  const returnDate = sp.get("return_date")?.trim();
  if (trip === "round_trip" && returnDate) return "round_trip";
  return "one_way";
}
