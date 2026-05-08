import { TTU_STAYS_SEARCH_SESSION_KEY } from "@/lib/http/stays.client";

/** Serializable destination for `sessionStorage` (mirrors `SelectedHotelLocation` in HotelsTab). */
export type StaysDestinationSnapshot =
  | { kind: "popular"; code: string; name: string; country: string }
  | {
      kind: "place";
      id: string;
      name: string;
      city_name?: string;
      iata_code: string;
      latitude: number;
      longitude: number;
      radius: number;
    };

export type StaysSearchFormSnapshot = {
  check_in_date: string;
  check_out_date: string;
  rooms: number;
  adults: number;
  children: number;
  destination?: StaysDestinationSnapshot;
};

function isPopularDest(x: unknown): x is StaysDestinationSnapshot & { kind: "popular" } {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    o.kind === "popular" &&
    typeof o.code === "string" &&
    typeof o.name === "string" &&
    typeof o.country === "string"
  );
}

function isPlaceDest(x: unknown): x is StaysDestinationSnapshot & { kind: "place" } {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    o.kind === "place" &&
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.iata_code === "string" &&
    typeof o.latitude === "number" &&
    typeof o.longitude === "number" &&
    typeof o.radius === "number"
  );
}

export function parseDestinationSnapshot(raw: unknown): StaysDestinationSnapshot | null {
  if (isPopularDest(raw)) {
    return {
      kind: "popular",
      code: raw.code,
      name: raw.name,
      country: raw.country,
    };
  }
  if (isPlaceDest(raw)) {
    return {
      kind: "place",
      id: raw.id,
      name: raw.name,
      city_name: typeof raw.city_name === "string" ? raw.city_name : undefined,
      iata_code: raw.iata_code,
      latitude: raw.latitude,
      longitude: raw.longitude,
      radius: raw.radius,
    };
  }
  return null;
}

/**
 * Reads the last successful stays search form from `sessionStorage` (same payload as written
 * after `postStaysSearch`). Safe to call only in the browser.
 */
export function readStaysSearchFormSnapshot(): StaysSearchFormSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(TTU_STAYS_SEARCH_SESSION_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw) as { context?: unknown };
    const c = j.context;
    if (!c || typeof c !== "object") return null;
    const ctx = c as Record<string, unknown>;
    const check_in_date = ctx.check_in_date;
    const check_out_date = ctx.check_out_date;
    if (typeof check_in_date !== "string" || typeof check_out_date !== "string") return null;
    const rooms = Number(ctx.rooms);
    const adults = Number(ctx.adults);
    const children = Number(ctx.children);
    if (Number.isNaN(rooms) || Number.isNaN(adults) || Number.isNaN(children)) return null;

    const dest = parseDestinationSnapshot(ctx.destination);

    return {
      check_in_date,
      check_out_date,
      rooms: Math.max(1, Math.min(9, Math.floor(rooms))),
      adults: Math.max(1, Math.floor(adults)),
      children: Math.max(0, Math.floor(children)),
      ...(dest ? { destination: dest } : {}),
    };
  } catch {
    return null;
  }
}
