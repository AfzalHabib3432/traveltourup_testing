import { handleApiError } from "@/lib/api/error-handler";
import { successResponse } from "@/lib/api/response";
import { getCachedFeaturedFlightCards } from "@/lib/services/flights/featured-flights.service";

export const dynamic = "force-dynamic";

/**
 * Live featured deals (cached server-side). Same payload shape as marketing strip; useful for mobile / RN.
 */
export async function GET() {
  try {
    const cards = await getCachedFeaturedFlightCards();
    return successResponse({ cards, count: cards.length });
  } catch (e) {
    return handleApiError(e);
  }
}
