import type {
  StaysCancellationStep,
  StaysQuoteDto,
  StaysRateCondition,
  StaysRatesPayload,
  StaysRateRow,
  StaysSearchResultCard,
} from "@/lib/api/stays-dto";

function asRecord(v: unknown): Record<string, unknown> | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}

function str(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}

function num(v: unknown): number | null {
  if (typeof v !== "number" || Number.isNaN(v)) return null;
  return v;
}

function unwrapData(raw: unknown): Record<string, unknown> | null {
  const r = asRecord(raw);
  if (!r) return null;
  const d = r.data;
  const inner = asRecord(d);
  return inner;
}

function photoUrlFromAccommodation(acc: Record<string, unknown>): string | null {
  const photos = acc.photos;
  if (!Array.isArray(photos) || photos.length === 0) return null;
  const first = asRecord(photos[0]);
  const url = first ? str(first.url) : null;
  return url;
}

function parseLocation(acc: Record<string, unknown>) {
  const loc = asRecord(acc.location);
  if (!loc) {
    return {
      line_one: null as string | null,
      city: null as string | null,
      region: null as string | null,
      postal_code: null as string | null,
      country_code: null as string | null,
      lat: null as number | null,
      lng: null as number | null,
    };
  }
  const addr = asRecord(loc.address);
  const geo = asRecord(loc.geographic_coordinates);
  return {
    line_one: addr ? str(addr.line_one) : null,
    city: addr ? str(addr.city_name) : null,
    region: addr ? str(addr.region) : null,
    postal_code: addr ? str(addr.postal_code) : null,
    country_code: addr ? str(addr.country_code) : null,
    lat: geo ? num(geo.latitude) : null,
    lng: geo ? num(geo.longitude) : null,
  };
}

function cheapestFromResult(result: Record<string, unknown>): {
  total_amount: string | null;
  total_currency: string | null;
} {
  const nestedCandidates = [
    asRecord(result.cheapest_rate),
    asRecord(result.cheapest_room),
    asRecord(result.lowest_rate),
    asRecord(result.cheapest_accommodation_rate),
    asRecord(result.cheapest_stay),
    asRecord(result.cheapest_stay_amount),
    asRecord(result.lowest_public_rate),
    asRecord(result.cheapest_room_rate),
    asRecord(result.min_rate),
  ];
  for (const cheapest of nestedCandidates) {
    if (!cheapest) continue;
    const ta =
      str(cheapest.total_amount) ??
      str(cheapest.public_amount) ??
      str(cheapest.amount) ??
      str(cheapest.total) ??
      str(cheapest.value);
    const tc =
      str(cheapest.total_currency) ??
      str(cheapest.public_currency) ??
      str(cheapest.currency);
    if (ta) return { total_amount: ta, total_currency: tc };
  }

  const topTa =
    str(result.total_amount) ??
    str(result.total_amount_including_tax) ??
    str(result.cheapest_total_amount);
  const topTc = str(result.total_currency) ?? str(result.cheapest_total_currency);
  if (topTa) return { total_amount: topTa, total_currency: topTc };

  return { total_amount: null, total_currency: null };
}

export function parseStaysSearchResults(raw: unknown): StaysSearchResultCard[] {
  const data = unwrapData(raw);
  if (!data) return [];

  const results = data.results;
  if (!Array.isArray(results)) return [];

  const cards: StaysSearchResultCard[] = [];
  for (const item of results) {
    const row = asRecord(item);
    if (!row) continue;
    const sid = str(row.id);
    const acc = asRecord(row.accommodation);
    if (!sid || !acc) continue;
    const aid = str(acc.id);
    if (!aid) continue;
    const loc = parseLocation(acc);
    const cheap = cheapestFromResult(row);
    const addrParts = [loc.line_one, loc.city, loc.country_code].filter(Boolean);
    cards.push({
      search_result_id: sid,
      accommodation_id: aid,
      name: str(acc.name) ?? "Hotel",
      address_line: addrParts.length ? addrParts.join(", ") : null,
      city: loc.city,
      country_code: loc.country_code,
      latitude: loc.lat,
      longitude: loc.lng,
      total_amount: cheap.total_amount,
      total_currency: cheap.total_currency,
      nightly_from_amount: str(row.nightly_from_amount) ?? str(acc.nightly_from_amount),
      nightly_from_currency: str(row.nightly_from_currency) ?? str(acc.nightly_from_currency),
      review_score: num(acc.review_score),
      rating_stars: num(acc.rating),
      photo_url: photoUrlFromAccommodation(acc),
    });
  }
  return cards;
}

function parseCancellationTimeline(
  rate: Record<string, unknown>,
  totalCurrency: string | null,
): StaysCancellationStep[] {
  const raw = rate.cancellation_timeline;
  if (!Array.isArray(raw)) return [];
  const out: StaysCancellationStep[] = [];
  for (const it of raw) {
    const o = asRecord(it);
    if (!o) continue;
    const before = str(o.before);
    const refund = str(o.refund_amount);
    if (!before || !refund) continue;
    out.push({
      before,
      refund_amount: refund,
      currency: str(o.currency) ?? totalCurrency,
    });
  }
  return out;
}

function parseRateConditions(rate: Record<string, unknown>): StaysRateCondition[] {
  const raw = rate.conditions;
  if (!Array.isArray(raw)) return [];
  const out: StaysRateCondition[] = [];
  for (const c of raw) {
    const cr = asRecord(c);
    if (!cr) continue;
    const title = str(cr.title);
    if (title) out.push({ title, description: str(cr.description) });
  }
  return out;
}

function collectRatesFromRooms(rooms: unknown[], accommodationPhotos: string[]): StaysRateRow[] {
  const rates: StaysRateRow[] = [];
  if (!Array.isArray(rooms)) return rates;

  for (const roomItem of rooms) {
    const room = asRecord(roomItem);
    if (!room) continue;
    const roomName = str(room.name) ?? "Room";
    let roomImg: string | null = null;
    if (Array.isArray(room.photos) && room.photos.length > 0) {
      const p0 = asRecord(room.photos[0]);
      roomImg = p0 ? str(p0.url) : null;
    }

    const roomRates = room.rates;
    if (!Array.isArray(roomRates)) continue;
    for (const rItem of roomRates) {
      const rate = asRecord(rItem);
      if (!rate) continue;
      const rid = str(rate.id);
      const total = str(rate.total_amount);
      const cur = str(rate.total_currency);
      if (!rid || !total || !cur) continue;
      const timeline = parseCancellationTimeline(rate, cur);
      rates.push({
        rate_id: rid,
        room_name: roomName,
        board_type: str(rate.board_type),
        total_amount: total,
        total_currency: cur,
        base_amount: str(rate.base_amount),
        base_currency: str(rate.base_currency),
        description: str(rate.description),
        payment_type: str(rate.payment_type),
        room_image_url: roomImg ?? accommodationPhotos[0] ?? null,
        cancellation_timeline: timeline,
        negotiated_rate_id: str(rate.negotiated_rate_id) ?? null,
        rate_code: str(rate.code) ?? null,
        supported_loyalty_programme: str(rate.supported_loyalty_programme) ?? null,
        conditions: parseRateConditions(rate),
      });
    }
  }
  return rates;
}

export function parseStaysFetchAllRates(raw: unknown, searchResultId: string): StaysRatesPayload | null {
  const data = unwrapData(raw);
  if (!data) return null;

  const acc = asRecord(data.accommodation) ?? asRecord(data);
  if (!acc) return null;
  const aid = str(acc.id);
  const name = str(acc.name);
  if (!aid || !name) return null;

  const loc = parseLocation(acc);
  const photos: string[] = [];
  if (Array.isArray(acc.photos)) {
    for (const p of acc.photos) {
      const pr = asRecord(p);
      const u = pr ? str(pr.url) : null;
      if (u) photos.push(u);
    }
  }

  const amenities: { type: string; description: string | null }[] = [];
  if (Array.isArray(acc.amenities)) {
    for (const a of acc.amenities) {
      const ar = asRecord(a);
      if (!ar) continue;
      const t = str(ar.type);
      if (t) amenities.push({ type: t, description: str(ar.description) });
    }
  }

  const checkInfo = asRecord(acc.check_in_information);
  /** `data.rooms` is the room *count* (number); room *types* live on `accommodation`, i.e. `acc.rooms`. */
  const roomList = Array.isArray(acc.rooms) ? acc.rooms : [];

  const rates = collectRatesFromRooms(roomList, photos);

  return {
    search_result_id: searchResultId,
    accommodation: {
      id: aid,
      name,
      description: str(acc.description),
      review_score: num(acc.review_score),
      rating: num(acc.rating),
      phone_number: str(acc.phone_number),
      email: str(acc.email),
      location: {
        latitude: loc.lat,
        longitude: loc.lng,
        line_one: loc.line_one,
        city: loc.city,
        region: loc.region,
        postal_code: loc.postal_code,
        country_code: loc.country_code,
      },
      photos,
      amenities,
      check_in_after_time: checkInfo ? str(checkInfo.check_in_after_time) : null,
      check_out_before_time: checkInfo ? str(checkInfo.check_out_before_time) : null,
    },
    rates,
  };
}

export function parseStaysQuote(raw: unknown, rateIdFallback: string): StaysQuoteDto | null {
  const data = unwrapData(raw);
  if (!data) return null;
  const qid = str(data.id);
  if (!qid) return null;
  const rate = asRecord(data.rate);
  const rid = rate ? str(rate.id) : null;
  return {
    quote_id: qid,
    rate_id: rid ?? rateIdFallback,
    expires_at: str(data.expires_at),
    total_amount: str(data.total_amount) ?? (rate ? str(rate.total_amount) : null),
    total_currency: str(data.total_currency) ?? (rate ? str(rate.total_currency) : null),
    due_at_accommodation_amount: str(data.due_at_accommodation_amount),
    due_at_accommodation_currency: str(data.due_at_accommodation_currency),
  };
}

export function parseStaysBooking(raw: unknown): {
  id: string;
  reference: string | null;
  status: string | null;
  total_amount: string | null;
  total_currency: string | null;
  accommodation: Record<string, unknown> | null;
} | null {
  const data = unwrapData(raw);
  if (!data) return null;
  const id = str(data.id);
  if (!id) return null;
  const acc = asRecord(data.accommodation);
  let total = str(data.total_amount);
  let cur = str(data.total_currency);
  if (!total && acc?.rooms && Array.isArray(acc.rooms)) {
    const r0 = asRecord(acc.rooms[0]);
    const rates = r0 && Array.isArray(r0.rates) ? r0.rates : [];
    const rate0 = asRecord(rates[0]);
    if (rate0) {
      total = str(rate0.total_amount);
      cur = str(rate0.total_currency);
    }
  }
  return {
    id,
    reference: str(data.reference),
    status: str(data.status),
    total_amount: total,
    total_currency: cur,
    accommodation: acc,
  };
}
