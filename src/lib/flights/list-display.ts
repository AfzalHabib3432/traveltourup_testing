import type { FlightOfferDTO, FlightSegmentDTO } from "@/lib/duffel/dto/flight-offer.dto";
import { sliceDurationMinutes } from "@/lib/flights/duration";

/** One segment row for expanded “timeline” UI on the result card. */
export type FlightListSegmentDetail = {
  departing_at: string | null;
  arriving_at: string | null;
  origin_iata: string;
  destination_iata: string;
  origin_name: string;
  destination_name: string;
  origin_terminal: string | null;
  destination_terminal: string | null;
  cabin_class: string | null;
};

/** Shape consumed by `FlightList` / `FlightDetail` cards (aligned with former mock fields). */
export type FlightListDisplay = {
  id: string;
  airline: string;
  /** Prefer marketing-style short label (IATA) — legacy field name. */
  airlineCode: string;
  /** Full marketing name when available. */
  airlineName: string | null;
  airlineLogoUrl: string | null;
  flightNumber: string;
  /** All slice-0 segment numbers / flights for client filters, uppercased. */
  flightNumbersSearch: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  /** Total block minutes for first slice (sort + time filters). */
  durationMinutes: number;
  stops: number;
  stopDetails: string;
  layoverSummary: string;
  price: number;
  currency: string;
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
  /** Human hint when arrival is next calendar day vs departure. */
  arrivalDateLabel: string;
  firstDepartingAt: string | null;
  lastArrivingAt: string | null;
  amenities: string[];
  baggage: string;
  refundable: boolean;
  rating: number;
  reviews: number;
  departureTerminal: string;
  arrivalTerminal: string;
  expires_at: string | null;
  /** Comparison modal (`GenericComparison` flight config) */
  fromCode: string;
  toCode: string;
  freeCancellation: boolean;
  seatSelection: boolean;
  segmentDetails: FlightListSegmentDetail[];
  fareBrandName: string | null;
};

function fmtTime(iso: string | null | undefined): string {
  if (!iso) return "--:--";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--:--";
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function fmtDurationFromSlice(segments: FlightSegmentDTO[]): string {
  if (!segments.length) return "—";
  const mins = sliceDurationMinutes(segments);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function layoverSummaryFromSegments(segments: FlightSegmentDTO[]): string {
  if (segments.length < 2) return "";
  const parts: string[] = [];
  for (let i = 0; i < segments.length - 1; i++) {
    const arr = segments[i]?.arriving_at;
    const dep = segments[i + 1]?.departing_at;
    if (!arr || !dep) continue;
    const ms = new Date(dep).getTime() - new Date(arr).getTime();
    if (!Number.isFinite(ms) || ms < 0) continue;
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const dur = h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}`.trim() : `${m}m`;
    parts.push(`${dur} ${segments[i]!.destination_iata}`.trim());
  }
  return parts.join(" · ");
}

function arrivalDayLabel(firstDep: string | null, lastArr: string | null, fallback: string): string {
  if (!lastArr) return fallback;
  if (!firstDep) return lastArr.slice(0, 10);
  const d0 = new Date(firstDep);
  const d1 = new Date(lastArr);
  if (Number.isNaN(d0.getTime()) || Number.isNaN(d1.getTime())) return lastArr.slice(0, 10);
  const dayDiff = Math.round((d1.getTime() - d0.getTime()) / 86400000);
  if (dayDiff >= 1) return `${fmtTime(lastArr)} (+${dayDiff})`;
  return lastArr.slice(0, 10);
}

function segmentSearchBlob(segments: FlightSegmentDTO[]): string {
  return segments
    .map((s) =>
      `${s.marketing_carrier_iata ?? ""} ${s.flight_number ?? ""}`.trim().toUpperCase(),
    )
    .join(" ");
}

export function sliceFingerprintForRoundTrip(slice: FlightOfferDTO["slices"][number] | undefined): string {
  if (!slice) return "";
  return slice.segments
    .map(
      (s) =>
        `${s.departing_at ?? ""}|${s.arriving_at ?? ""}|${s.origin_iata}|${s.destination_iata}|${s.flight_number ?? ""}`,
    )
    .join("~");
}

/** Key for grouping “same itinerary” offers (fare siblings). All slices. */
export function offerItineraryFingerprint(offer: FlightOfferDTO): string {
  return offer.slices.map((sl) => sliceFingerprintForRoundTrip(sl)).join("||");
}

export function flightOfferToListDisplayForSlice(
  offer: FlightOfferDTO,
  sliceIndex: number,
): FlightListDisplay {
  const slice = offer.slices[sliceIndex] ?? offer.slices[0];
  const firstSeg = slice?.segments[0];
  const lastSeg = slice?.segments[slice.segments.length - 1];
  const carrier =
    firstSeg?.marketing_carrier_iata ?? firstSeg?.operating_carrier_iata ?? "—";
  const fn = firstSeg?.flight_number ?? "—";
  const dep = firstSeg?.departing_at;
  const arr = lastSeg?.arriving_at;

  const stops = slice?.stops_count ?? 0;
  const stopDetails = stops === 0 ? "Nonstop" : `${stops} stop${stops > 1 ? "s" : ""}`;
  const layoverSummary = slice ? layoverSummaryFromSegments(slice.segments) : "";
  const segments = slice?.segments ?? [];
  const durationMinutes = sliceDurationMinutes(segments);

  const depDate = dep?.slice(0, 10) ?? "";
  const operatingName = firstSeg?.operating_carrier_name ?? firstSeg?.marketing_carrier_name ?? null;
  const displayName = operatingName ?? carrier;
  const logo = firstSeg?.marketing_carrier_logo_url ?? null;

  const segmentDetails: FlightListSegmentDetail[] = segments.map((s) => ({
    departing_at: s.departing_at,
    arriving_at: s.arriving_at,
    origin_iata: s.origin_iata,
    destination_iata: s.destination_iata,
    origin_name: s.origin_name,
    destination_name: s.destination_name,
    origin_terminal: s.origin_terminal,
    destination_terminal: s.destination_terminal,
    cabin_class: s.cabin_class,
  }));

  const fareBrand =
    segments.map((s) => s.fare_brand_name).find((x) => x != null && x.length > 0) ?? null;

  const row: FlightListDisplay = {
    id: offer.id,
    airline: displayName,
    airlineCode: carrier,
    airlineName: displayName,
    airlineLogoUrl: logo,
    flightNumber: `${carrier} ${fn}`,
    flightNumbersSearch: segmentSearchBlob(segments),
    departureTime: fmtTime(dep),
    arrivalTime: fmtTime(arr),
    duration: fmtDurationFromSlice(segments),
    durationMinutes,
    stops,
    stopDetails,
    layoverSummary,
    price: parseFloat(offer.total_amount),
    currency: offer.total_currency,
    departureAirport: slice?.origin_iata ?? firstSeg?.origin_iata ?? "—",
    arrivalAirport: slice?.destination_iata ?? lastSeg?.destination_iata ?? "—",
    departureDate: depDate,
    arrivalDateLabel: arrivalDayLabel(dep ?? null, arr ?? null, depDate),
    firstDepartingAt: dep ?? null,
    lastArrivingAt: arr ?? null,
    amenities:
      firstSeg?.cabin_class === "business" || firstSeg?.cabin_class === "first"
        ? ["meals"]
        : ["wifi", "meals"],
    baggage: "See fare on airline site",
    refundable: false,
    rating: 4.5,
    reviews: 0,
    departureTerminal: firstSeg?.origin_terminal ?? "—",
    arrivalTerminal: lastSeg?.destination_terminal ?? "—",
    expires_at: offer.expires_at,
    fromCode: slice?.origin_iata ?? firstSeg?.origin_iata ?? "—",
    toCode: slice?.destination_iata ?? lastSeg?.destination_iata ?? "—",
    freeCancellation: false,
    seatSelection: false,
    segmentDetails,
    fareBrandName: fareBrand,
  };

  return row;
}

/** Group round-trip offers by identical outbound slice (Duffel-style outbound → return flow). */
export type RoundTripCluster = {
  key: string;
  offers: FlightOfferDTO[];
  display: FlightListDisplay;
};

export function clusterOffersByOutboundSlice(offers: FlightOfferDTO[]): RoundTripCluster[] {
  const m = new Map<string, FlightOfferDTO[]>();
  for (const o of offers) {
    const s0 = o.slices[0];
    if (!s0 || o.slices.length < 2) continue;
    const k = sliceFingerprintForRoundTrip(s0);
    if (!m.has(k)) m.set(k, []);
    m.get(k)!.push(o);
  }
  const out: RoundTripCluster[] = [];
  for (const [key, list] of m) {
    const minPrice = Math.min(...list.map((x) => parseFloat(x.total_amount)));
    const cheapest = list.reduce((a, b) =>
      parseFloat(a.total_amount) <= parseFloat(b.total_amount) ? a : b,
    );
    const d = flightOfferToListDisplayForSlice(cheapest, 0);
    out.push({
      key,
      offers: list,
      display: { ...d, id: `cluster:${key}`, price: minPrice },
    });
  }
  out.sort((a, b) => a.display.price - b.display.price);
  return out;
}

export function flightOfferToListDisplay(offer: FlightOfferDTO): FlightListDisplay {
  return flightOfferToListDisplayForSlice(offer, 0);
}
