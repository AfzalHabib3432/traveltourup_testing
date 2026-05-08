import { AIRPORTS } from "@/data/airports";
import type { Airport } from "@/types/flight";
import { duffelCabinToUi } from "@/lib/validations/flights.schema";
import { flightSearchBodyFromUrl } from "@/lib/flights/search-from-url";
import {
  mergeSliceTimeWindowsFromUrl,
  parseChildAgesFromUrl,
} from "@/lib/flights/search-url-extras";
import type { FlightSearchBody } from "@/lib/validations/flights.schema";

const DUFFEL_CABINS = ["economy", "premium_economy", "business", "first"] as const;

function normalizeCabinRaw(raw: string): string {
  const r = raw.trim().toLowerCase();
  if ((DUFFEL_CABINS as readonly string[]).includes(r)) return r;
  return "economy";
}

/** Minimal airport row when the code is not in the static POPULAR list. */
function airportFromIata(iata: string): Airport {
  const code = iata.trim().toUpperCase();
  const found = AIRPORTS.find((a) => a.code === code);
  if (found) return found;
  return { code, name: code, city: "", country: "" };
}

function monthYearFromYmd(
  ymd: string,
  fallback: { month: number; year: number },
): { month: number; year: number } {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return fallback;
  const [ys, ms] = ymd.split("-");
  const y = parseInt(ys ?? "", 10);
  const m = parseInt(ms ?? "", 10);
  if (Number.isNaN(y) || Number.isNaN(m)) return fallback;
  return { month: m - 1, year: y };
}

function readSliceTimes(sp: URLSearchParams, idx: number) {
  return {
    depFrom: sp.get(`s${idx}_dep_from`)?.trim() ?? "",
    depTo: sp.get(`s${idx}_dep_to`)?.trim() ?? "",
    arrFrom: sp.get(`s${idx}_arr_from`)?.trim() ?? "",
    arrTo: sp.get(`s${idx}_arr_to`)?.trim() ?? "",
  };
}

export type HydratedFlightsFormState = {
  tripType: string;
  cabinClass: string;
  travelers: { adults: number; children: number; infants: number };
  childAges: number[];
  selectedFromAirport: Airport | null;
  selectedToAirport: Airport | null;
  departDate: string;
  returnDate: string;
  flights: Array<{ id: number; from: Airport | null; to: Airport | null; date: string }>;
  advMaxConnections: string;
  advSupplierTimeout: number;
  preferredCarrierIatas: string[];
  s0DepFrom: string;
  s0DepTo: string;
  s0ArrFrom: string;
  s0ArrTo: string;
  s1DepFrom: string;
  s1DepTo: string;
  s1ArrFrom: string;
  s1ArrTo: string;
  currentMonth: number;
  currentYear: number;
  returnCurrentMonth: number;
  returnCurrentYear: number;
};

const now = () => new Date();

/**
 * Maps `/flights?…` back to `FlightsTab` controlled fields. Returns `null` when the URL
 * does not describe a runnable search (same rule as {@link flightSearchBodyFromUrl}).
 */
export function hydrateFlightsFormFromUrl(sp: URLSearchParams): HydratedFlightsFormState | null {
  if (flightSearchBodyFromUrl(sp) == null) return null;

  const adults = Math.max(1, parseInt(sp.get("adults") ?? "1", 10) || 1);
  const children = Math.max(0, parseInt(sp.get("children") ?? "0", 10) || 0);
  const infants = Math.max(0, parseInt(sp.get("infants") ?? "0", 10) || 0);
  const cabinRaw = normalizeCabinRaw(sp.get("cabin_class") ?? "economy");
  const cabinClass = duffelCabinToUi(cabinRaw);

  const agesParsed = parseChildAgesFromUrl(sp);
  let childAges = agesParsed.slice(0, children);
  while (childAges.length < children) childAges.push(8);

  const carriers = sp
    .getAll("carrier_iata")
    .map((c) => c.trim().toUpperCase())
    .filter((c) => c.length >= 2 && c.length <= 3);

  const maxConnRaw = sp.get("max_connections");
  const advMaxConnections =
    maxConnRaw != null && !Number.isNaN(parseInt(maxConnRaw, 10)) ? String(parseInt(maxConnRaw, 10)) : "";
  const stRaw = sp.get("supplier_timeout");
  let advSupplierTimeout = 60000;
  if (stRaw != null) {
    const n = parseInt(stRaw, 10);
    if (!Number.isNaN(n)) advSupplierTimeout = Math.min(120_000, Math.max(1000, n));
  }

  const multiSlicesJson = sp.get("slices");
  if (multiSlicesJson) {
    let slices: FlightSearchBody["slices"];
    try {
      slices = JSON.parse(multiSlicesJson) as FlightSearchBody["slices"];
    } catch {
      return null;
    }
    if (!Array.isArray(slices) || slices.length < 1) return null;
    slices = mergeSliceTimeWindowsFromUrl(slices, sp);

    const flights = slices.map((s, i) => ({
      id: i + 1,
      from: airportFromIata(s.origin),
      to: airportFromIata(s.destination),
      date: s.departure_date,
    }));

    const t0 = readSliceTimes(sp, 0);
    const fb = { month: now().getMonth(), year: now().getFullYear() };
    const firstDate = slices[0]?.departure_date ?? "";
    const cy = monthYearFromYmd(firstDate, fb);

    return {
      tripType: "multi-city",
      cabinClass,
      travelers: { adults, children, infants },
      childAges,
      selectedFromAirport: slices[0] ? airportFromIata(slices[0].origin) : null,
      selectedToAirport: slices[0] ? airportFromIata(slices[0].destination) : null,
      departDate: firstDate,
      returnDate: "",
      flights,
      advMaxConnections,
      advSupplierTimeout,
      preferredCarrierIatas: carriers,
      s0DepFrom: t0.depFrom,
      s0DepTo: t0.depTo,
      s0ArrFrom: t0.arrFrom,
      s0ArrTo: t0.arrTo,
      s1DepFrom: "",
      s1DepTo: "",
      s1ArrFrom: "",
      s1ArrTo: "",
      currentMonth: cy.month,
      currentYear: cy.year,
      returnCurrentMonth: cy.month,
      returnCurrentYear: cy.year,
    };
  }

  const origin = sp.get("origin")?.trim().toUpperCase() ?? "";
  const destination = sp.get("destination")?.trim().toUpperCase() ?? "";
  const departureDate = sp.get("departure_date")?.trim() ?? "";
  const returnD = sp.get("return_date")?.trim() ?? "";
  const trip = sp.get("trip") ?? "one_way";

  const fromA = airportFromIata(origin);
  const toA = airportFromIata(destination);
  const s0 = readSliceTimes(sp, 0);
  const s1 = readSliceTimes(sp, 1);

  const fb = { month: now().getMonth(), year: now().getFullYear() };
  const departCY = monthYearFromYmd(departureDate, fb);
  const returnCY = monthYearFromYmd(returnD || departureDate, fb);

  if (trip === "round_trip" && returnD) {
    return {
      tripType: "round-trip",
      cabinClass,
      travelers: { adults, children, infants },
      childAges,
      selectedFromAirport: fromA,
      selectedToAirport: toA,
      departDate: departureDate,
      returnDate: returnD,
      flights: [{ id: 1, from: null, to: null, date: "" }],
      advMaxConnections,
      advSupplierTimeout,
      preferredCarrierIatas: carriers,
      s0DepFrom: s0.depFrom,
      s0DepTo: s0.depTo,
      s0ArrFrom: s0.arrFrom,
      s0ArrTo: s0.arrTo,
      s1DepFrom: s1.depFrom,
      s1DepTo: s1.depTo,
      s1ArrFrom: s1.arrFrom,
      s1ArrTo: s1.arrTo,
      currentMonth: departCY.month,
      currentYear: departCY.year,
      returnCurrentMonth: returnCY.month,
      returnCurrentYear: returnCY.year,
    };
  }

  return {
    tripType: "one-way",
    cabinClass,
    travelers: { adults, children, infants },
    childAges,
    selectedFromAirport: fromA,
    selectedToAirport: toA,
    departDate: departureDate,
    returnDate: "",
    flights: [{ id: 1, from: null, to: null, date: "" }],
    advMaxConnections,
    advSupplierTimeout,
    preferredCarrierIatas: carriers,
    s0DepFrom: s0.depFrom,
    s0DepTo: s0.depTo,
    s0ArrFrom: s0.arrFrom,
    s0ArrTo: s0.arrTo,
    s1DepFrom: "",
    s1DepTo: "",
    s1ArrFrom: "",
    s1ArrTo: "",
    currentMonth: departCY.month,
    currentYear: departCY.year,
    returnCurrentMonth: returnCY.month,
    returnCurrentYear: returnCY.year,
  };
}
