import "server-only";

import { unstable_cache } from "next/cache";
import { createOfferRequest } from "@/lib/duffel/offer-requests";
import { mapDuffelOfferToDto, type FlightOfferDTO } from "@/lib/duffel/dto/flight-offer.dto";
import { isDuffelConfigured } from "@/lib/duffel/config";
import type { FlightCardData } from "@/components/ui/Card";
import {
  FEATURED_FLIGHT_ROUTES,
  FEATURED_DEPARTURE_OFFSET_DAYS,
  FEATURED_FLIGHTS_REVALIDATE_SECONDS,
} from "@/config/featured-flights";
import { flightOfferToFeaturedCard } from "@/lib/flights/featured-card-mapper";

type OfferRequestBody = {
  data?: { offers?: unknown[] };
};

function departureDateIso(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + FEATURED_DEPARTURE_OFFSET_DAYS);
  return d.toISOString().slice(0, 10);
}

async function cheapestOfferOnRoute(
  origin: string,
  destination: string,
  departureDate: string,
): Promise<FlightOfferDTO | null> {
  const raw = (await createOfferRequest({
    slices: [
      {
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        departure_date: departureDate,
      },
    ],
    passengers: [{ type: "adult" }],
    cabin_class: "economy",
  })) as OfferRequestBody;

  const rawOffers = raw?.data?.offers;
  if (!Array.isArray(rawOffers) || rawOffers.length === 0) return null;

  const dtos: FlightOfferDTO[] = [];
  for (const item of rawOffers) {
    try {
      dtos.push(mapDuffelOfferToDto(item));
    } catch {
      /* skip */
    }
  }
  if (dtos.length === 0) return null;

  dtos.sort((a, b) => parseFloat(a.total_amount) - parseFloat(b.total_amount));
  return dtos[0] ?? null;
}

async function loadFeaturedFlightCardsUncached(): Promise<FlightCardData[]> {
  if (!isDuffelConfigured()) {
    return [];
  }

  const departureDate = departureDateIso();
  const results = await Promise.all(
    FEATURED_FLIGHT_ROUTES.map(async (route) => {
      try {
        const offer = await cheapestOfferOnRoute(route.origin, route.destination, departureDate);
        return offer ? flightOfferToFeaturedCard(offer) : null;
      } catch (e) {
        console.error(
          "Featured flight route failed:",
          route.origin,
          route.destination,
          e instanceof Error ? e.message : e,
        );
        return null;
      }
    }),
  );

  return results.filter((x): x is FlightCardData => x != null);
}

/**
 * Cached featured cards for the homepage / flights marketing strip.
 * One offer request per configured route on cache miss — tune `FEATURED_FLIGHT_ROUTES` in prod.
 */
export function getCachedFeaturedFlightCards(): Promise<FlightCardData[]> {
  return unstable_cache(
    () => loadFeaturedFlightCardsUncached(),
    ["featured-flight-cards", FEATURED_DEPARTURE_OFFSET_DAYS.toString()],
    { revalidate: FEATURED_FLIGHTS_REVALIDATE_SECONDS },
  )();
}
