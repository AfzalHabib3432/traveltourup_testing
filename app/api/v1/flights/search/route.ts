import { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/error-handler";
import { AppError, ValidationError } from "@/lib/api/errors";
import { clientIpFromHeaders, rateLimitByKey } from "@/lib/api/rate-limit-ip";
import { successResponse } from "@/lib/api/response";
import { getServerAuthz } from "@/lib/authz/session";
import { isDuffelConfigured } from "@/lib/duffel/config";
import { runFlightSearch } from "@/lib/services/flights/flights-search.service";
import { flightSearchBodySchema } from "@/lib/validations/flights.schema";
export const dynamic = "force-dynamic";

const ANON_SEARCH_PER_MINUTE = 25;
const AUTH_SEARCH_PER_MINUTE = 80;

export async function POST(req: NextRequest) {
  try {
    if (!isDuffelConfigured()) {
      throw new AppError(503, "Flight search is not configured.", "FLIGHTS_NOT_CONFIGURED");
    }

    const { userId } = await getServerAuthz();
    const ip = clientIpFromHeaders((n) => req.headers.get(n));
    const limitKey = userId ? `flight-search:user:${userId}` : `flight-search:ip:${ip}`;
    const max = userId ? AUTH_SEARCH_PER_MINUTE : ANON_SEARCH_PER_MINUTE;
    const rl = rateLimitByKey(limitKey, max);
    if (!rl.ok) {
      throw new AppError(
        429,
        "Too many flight searches. Please wait and try again.",
        "RATE_LIMITED",
      );
    }

    const json = (await req.json()) as unknown;
    const parsed = flightSearchBodySchema.safeParse(json);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues);
    }

    const data = await runFlightSearch(parsed.data, { userId });
    return successResponse(data);
  } catch (e) {
    return handleApiError(e);
  }
}
