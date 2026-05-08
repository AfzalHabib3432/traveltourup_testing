"use client";

import { useDebouncedSuggestionFetch } from "@/lib/hooks/useDebouncedSuggestionFetch";
import {
  getStaysPlaces,
  type HotelLocationSuggestionDto,
} from "@/lib/http/stays.client";

/**
 * Debounced Duffel place lookup for Stays (min 2 chars; aborts stale requests).
 * Same timing and behavior as {@link useDuffelAirportSuggest}.
 */
export function useDuffelHotelLocationSuggest(
  open: boolean,
  query: string,
): { rows: HotelLocationSuggestionDto[]; loading: boolean } {
  return useDebouncedSuggestionFetch<HotelLocationSuggestionDto>({
    open,
    query,
    fetcher: async (q) => {
      const r = await getStaysPlaces({ q, limit: 22 });
      return r.places ?? [];
    },
  });
}
