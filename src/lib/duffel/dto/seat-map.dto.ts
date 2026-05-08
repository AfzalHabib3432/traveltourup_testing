/**
 * Trimmed seat map DTO for checkout UI (Duffel `GET /air/seat_maps`).
 * @see https://duffel.com/docs/api/seat-maps
 */

export type SeatMapSeatServiceDTO = {
  id: string;
  passenger_id: string;
  total_amount: string;
  total_currency: string;
};

export type SeatMapElementDTO = {
  type: string;
  designator: string | null;
  disclosures: string[];
  services: SeatMapSeatServiceDTO[];
};

export type SeatMapRowDTO = {
  sections: { elements: SeatMapElementDTO[] }[];
};

export type SeatMapCabinDTO = {
  cabin_class: string | null;
  deck: number | null;
  aisles: number | null;
  rows: SeatMapRowDTO[];
};

export type SeatMapDTO = {
  id: string;
  segment_id: string | null;
  slice_id: string | null;
  cabins: SeatMapCabinDTO[];
};

function asString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function mapService(raw: unknown): SeatMapSeatServiceDTO | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = asString(o.id);
  const passenger_id = asString(o.passenger_id);
  const total_amount = asString(o.total_amount);
  const total_currency = asString(o.total_currency);
  if (!id || !passenger_id || !total_amount || !total_currency) return null;
  return { id, passenger_id, total_amount, total_currency };
}

function mapElement(raw: unknown): SeatMapElementDTO | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const type = asString(o.type) ?? "unknown";
  const servicesRaw = o.available_services;
  const services: SeatMapSeatServiceDTO[] = [];
  if (Array.isArray(servicesRaw)) {
    for (const s of servicesRaw) {
      const m = mapService(s);
      if (m) services.push(m);
    }
  }
  return {
    type,
    designator: asString(o.designator),
    disclosures: Array.isArray(o.disclosures)
      ? o.disclosures.filter((d): d is string => typeof d === "string")
      : [],
    services,
  };
}

function mapRow(raw: unknown): SeatMapRowDTO | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const sectionsRaw = o.sections;
  const sections: { elements: SeatMapElementDTO[] }[] = [];
  if (Array.isArray(sectionsRaw)) {
    for (const sec of sectionsRaw) {
      if (!sec || typeof sec !== "object") continue;
      const elsRaw = (sec as Record<string, unknown>).elements;
      const elements: SeatMapElementDTO[] = [];
      if (Array.isArray(elsRaw)) {
        for (const el of elsRaw) {
          const m = mapElement(el);
          if (m) elements.push(m);
        }
      }
      sections.push({ elements });
    }
  }
  return { sections };
}

function mapCabin(raw: unknown): SeatMapCabinDTO | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const rowsRaw = o.rows;
  const rows: SeatMapRowDTO[] = [];
  if (Array.isArray(rowsRaw)) {
    for (const r of rowsRaw) {
      const m = mapRow(r);
      if (m) rows.push(m);
    }
  }
  const deck = o.deck;
  const aisles = o.aisles;
  return {
    cabin_class: asString(o.cabin_class),
    deck: typeof deck === "number" ? deck : null,
    aisles: typeof aisles === "number" ? aisles : null,
    rows,
  };
}

/** Maps Duffel `{ data: SeatMap[] }` to trimmed DTOs. */
export function mapDuffelSeatMapsResponse(raw: unknown): SeatMapDTO[] {
  if (!raw || typeof raw !== "object") return [];
  const root = raw as Record<string, unknown>;
  const data = root.data;
  if (!Array.isArray(data)) return [];
  const out: SeatMapDTO[] = [];
  for (const item of data) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const id = asString(o.id);
    if (!id) continue;
    const cabinsRaw = o.cabins;
    const cabins: SeatMapCabinDTO[] = [];
    if (Array.isArray(cabinsRaw)) {
      for (const c of cabinsRaw) {
        const m = mapCabin(c);
        if (m) cabins.push(m);
      }
    }
    out.push({
      id,
      segment_id: asString(o.segment_id),
      slice_id: asString(o.slice_id),
      cabins,
    });
  }
  return out;
}
