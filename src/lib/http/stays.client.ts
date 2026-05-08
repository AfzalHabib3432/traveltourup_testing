"use client";

import { apiJson } from "@/lib/http/api-client";
import type { HotelLocationSuggestionDto } from "@/lib/api/stays-places.dto";
import type { StaysSearchResultCard } from "@/lib/api/stays-dto";
import type { StaysRatesPayload, StaysQuoteDto } from "@/lib/api/stays-dto";
import type { StaysSearchBodyInput, StaysBookingBodyInput } from "@/lib/validations/stays.schema";

export const STAYS_V1_BASE = "/api/v1/stays";

/** Browser sessionStorage + window events: hero search → results list while API runs. */
export const TTU_STAYS_SEARCH_SESSION_KEY = "ttu_stays_search";
export const TTU_STAYS_SEARCH_PENDING_KEY = "ttu_stays_search_pending";
export const TTU_STAYS_SEARCH_STARTED_EVENT = "ttu-stays-search-started";
export const TTU_STAYS_SEARCH_UPDATED_EVENT = "ttu-stays-search-updated";

export type { HotelLocationSuggestionDto } from "@/lib/api/stays-places.dto";

export async function getStaysPlaces(params: {
  q: string;
  limit?: number;
}): Promise<{ places: HotelLocationSuggestionDto[] }> {
  const p = new URLSearchParams();
  if (params.q?.trim()) p.set("q", params.q.trim());
  if (params.limit != null) p.set("limit", String(params.limit));
  const qs = p.toString();
  return apiJson<{ places: HotelLocationSuggestionDto[] }>(`${STAYS_V1_BASE}/places${qs ? `?${qs}` : ""}`);
}

export type StaysSearchApiResult = {
  results: StaysSearchResultCard[];
  raw_meta: { count: number };
};

export async function postStaysSearch(body: StaysSearchBodyInput): Promise<StaysSearchApiResult> {
  return apiJson<StaysSearchApiResult>(`${STAYS_V1_BASE}/search`, { method: "POST", body });
}

export type StaysFeaturedApiResult = {
  cards: StaysSearchResultCard[];
  count: number;
};

export async function getStaysFeatured(): Promise<StaysFeaturedApiResult> {
  return apiJson<StaysFeaturedApiResult>(`${STAYS_V1_BASE}/featured`, { method: "GET" });
}

export async function getStaysRates(searchResultId: string): Promise<StaysRatesPayload> {
  return apiJson<StaysRatesPayload>(
    `${STAYS_V1_BASE}/search_results/${encodeURIComponent(searchResultId)}/rates`,
    { method: "GET" },
  );
}

export async function postStaysQuote(body: { rate_id: string }): Promise<StaysQuoteDto> {
  return apiJson<StaysQuoteDto>(`${STAYS_V1_BASE}/quotes`, { method: "POST", body });
}

/** Serialized booking from `serializeBookingResponse` (includes top-level `id`). */
export type StaysBookingApiResult = Record<string, unknown> & {
  id?: string;
  booking_ref_no?: string;
};

export async function postStaysBooking(
  body: StaysBookingBodyInput,
  idempotencyKey?: string,
): Promise<StaysBookingApiResult> {
  const headers: Record<string, string> = {};
  if (idempotencyKey?.trim()) {
    headers["Idempotency-Key"] = idempotencyKey.trim();
  }
  return apiJson<StaysBookingApiResult>(`${STAYS_V1_BASE}/bookings`, {
    method: "POST",
    body,
    headers,
  });
}
