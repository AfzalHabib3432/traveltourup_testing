import { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/error-handler";
import { AppError } from "@/lib/api/errors";
import { clientIpFromHeaders, rateLimitByKey } from "@/lib/api/rate-limit-ip";
import { successResponse } from "@/lib/api/response";
import { getServerAuthz } from "@/lib/authz/session";
import { isDuffelConfigured } from "@/lib/duffel/config";
import { getSeatMapsForOffer } from "@/lib/services/flights/flight-seat-maps.service";

type RouteContext = { params: Promise<{ offer_id: string }> };

export const dynamic = "force-dynamic";

const SEAT_MAPS_ANON_PER_MINUTE = 40;
const SEAT_MAPS_AUTH_PER_MINUTE = 80;

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    if (!isDuffelConfigured()) {
      throw new AppError(503, "Flight offers are not configured.", "FLIGHTS_NOT_CONFIGURED");
    }

    const { userId } = await getServerAuthz();
    const ip = clientIpFromHeaders((n) => _req.headers.get(n));
    const limitKey = userId ? `flight-seat-maps:user:${userId}` : `flight-seat-maps:ip:${ip}`;
    const max = userId ? SEAT_MAPS_AUTH_PER_MINUTE : SEAT_MAPS_ANON_PER_MINUTE;
    const rl = rateLimitByKey(limitKey, max);
    if (!rl.ok) {
      throw new AppError(429, "Too many requests. Please try again shortly.", "RATE_LIMITED");
    }

    const { offer_id: offerId } = await context.params;
    if (!offerId?.trim()) {
      throw new AppError(400, "Offer id is required.", "VALIDATION_ERROR");
    }

    const seat_maps = await getSeatMapsForOffer(offerId.trim());
    return successResponse({ offer_id: offerId.trim(), seat_maps });
  } catch (e) {
    return handleApiError(e);
  }
}
