"use client";

/**
 * Stable SWR-backed fetch for homepage / hotel-page featured sections.
 * Featured data does not depend on locale; caching avoids hammering Duffel on each language switch or remount.
 */
import useSWR from "swr";
import type { FlightCardData } from "@/components/ui/Card";
import { getStaysFeatured, type StaysFeaturedApiResult } from "@/lib/http/stays.client";

export const FEATURED_FLIGHTS_SWR_KEY = "/api/v1/flights/featured" as const;
export const FEATURED_STAYS_SWR_KEY = "/api/v1/stays/featured" as const;

type FlightsFeaturedEnvelope = { success?: boolean; data?: { cards?: FlightCardData[] } };

async function fetchFeaturedFlightCards(): Promise<FlightCardData[]> {
  const res = await fetch(FEATURED_FLIGHTS_SWR_KEY, { credentials: "same-origin" });
  if (!res.ok) throw new Error("featured_flights_fetch_failed");
  const j = (await res.json()) as FlightsFeaturedEnvelope;
  const list = j?.data?.cards;
  return Array.isArray(list) ? list : [];
}

const featuredOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  /** Same session: dedupe remounts, Strict Mode double-invoke, and parallel sections. */
  dedupingInterval: 3_600_000,
} as const;

export function useFeaturedFlightCardsQuery() {
  return useSWR<FlightCardData[], Error>(FEATURED_FLIGHTS_SWR_KEY, fetchFeaturedFlightCards, featuredOptions);
}

export function useFeaturedStaysQuery() {
  return useSWR<StaysFeaturedApiResult, Error>(FEATURED_STAYS_SWR_KEY, getStaysFeatured, featuredOptions);
}
