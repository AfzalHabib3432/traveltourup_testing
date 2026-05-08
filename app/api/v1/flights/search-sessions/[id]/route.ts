import { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/error-handler";
import { AppError } from "@/lib/api/errors";
import { clientIpFromHeaders, rateLimitByKey } from "@/lib/api/rate-limit-ip";
import { successResponse } from "@/lib/api/response";
import { getServerAuthz } from "@/lib/authz/session";
import { isDuffelConfigured } from "@/lib/duffel/config";
import { listOffersForFlightSearchSession } from "@/lib/services/flights/flights-offer-request.service";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const ANON_PER_MINUTE = 20;
const AUTH_PER_MINUTE = 60;

export async function GET(req: NextRequest, context: Ctx) {
  try {
    if (!isDuffelConfigured()) {
      throw new AppError(503, "Flight search is not configured.", "FLIGHTS_NOT_CONFIGURED");
    }

    const { userId } = await getServerAuthz();
    const ip = clientIpFromHeaders((n) => req.headers.get(n));
    const limitKey = userId ? `flight-session:user:${userId}` : `flight-session:ip:${ip}`;
    const max = userId ? AUTH_PER_MINUTE : ANON_PER_MINUTE;
    const rl = rateLimitByKey(limitKey, max);
    if (!rl.ok) {
      throw new AppError(429, "Too many requests.", "RATE_LIMITED");
    }

    const { id } = await context.params;
    if (!id?.trim()) throw new AppError(400, "Session id required.", "VALIDATION_ERROR");

    const { offers, expires_at } = await listOffersForFlightSearchSession(id.trim());
    return successResponse({
      offers,
      expires_at: expires_at.toISOString(),
    });
  } catch (e) {
    return handleApiError(e);
  }
}
