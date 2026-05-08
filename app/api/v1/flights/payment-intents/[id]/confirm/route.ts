import { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/error-handler";
import { AppError } from "@/lib/api/errors";
import { clientIpFromHeaders, rateLimitByKey } from "@/lib/api/rate-limit-ip";
import { successResponse } from "@/lib/api/response";
import { getServerAuthz } from "@/lib/authz/session";
import { isDuffelConfigured } from "@/lib/duffel/config";
import { confirmFlightCheckout } from "@/lib/payments/flight-payment-orchestrator";

type RouteContext = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

const ANON_PER_MINUTE = 30;
const AUTH_PER_MINUTE = 60;

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    if (!isDuffelConfigured()) {
      throw new AppError(503, "Flight payments are not configured.", "FLIGHTS_NOT_CONFIGURED");
    }

    const { userId } = await getServerAuthz();
    const ip = clientIpFromHeaders((n) => req.headers.get(n));
    const limitKey = userId
      ? `flight-pit-confirm:user:${userId}`
      : `flight-pit-confirm:ip:${ip}`;
    const max = userId ? AUTH_PER_MINUTE : ANON_PER_MINUTE;
    const rl = rateLimitByKey(limitKey, max);
    if (!rl.ok) {
      throw new AppError(429, "Too many requests. Please try again shortly.", "RATE_LIMITED");
    }

    const { id } = await context.params;
    if (!id?.trim()) {
      throw new AppError(400, "Payment intent id is required.", "VALIDATION_ERROR");
    }

    const data = await confirmFlightCheckout("duffel_payments", id.trim());
    return successResponse(data, 200);
  } catch (e) {
    return handleApiError(e);
  }
}
