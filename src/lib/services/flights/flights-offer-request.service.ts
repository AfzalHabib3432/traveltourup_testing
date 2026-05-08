import "server-only";

import { AppError } from "@/lib/api/errors";
import { mapDuffelOfferToDto, type FlightOfferDTO } from "@/lib/duffel/dto/flight-offer.dto";
import { getOfferRequest } from "@/lib/duffel/offer-requests";
import { prisma } from "@/lib/prisma";

type OfferRequestGet = {
  data?: {
    offers?: unknown[];
  };
};

export async function listOffersForFlightSearchSession(sessionId: string): Promise<{
  offers: FlightOfferDTO[];
  expires_at: Date;
}> {
  const session = await prisma.flightSearchSession.findUnique({
    where: { id: sessionId },
  });
  if (!session) {
    throw new AppError(404, "Search session not found.", "NOT_FOUND");
  }
  if (session.expires_at.getTime() < Date.now()) {
    throw new AppError(410, "Search session expired. Run a new search.", "GONE");
  }

  const raw = (await getOfferRequest(session.offer_request_id)) as OfferRequestGet;
  const rawOffers = raw?.data?.offers;
  const offers: FlightOfferDTO[] = [];
  if (Array.isArray(rawOffers)) {
    for (const item of rawOffers) {
      try {
        offers.push(mapDuffelOfferToDto(item));
      } catch {
        /* skip malformed */
      }
    }
  }

  return { offers, expires_at: session.expires_at };
}
