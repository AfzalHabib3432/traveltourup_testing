import { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/error-handler";
import { AppError } from "@/lib/api/errors";
import { clientIpFromHeaders, rateLimitByKey } from "@/lib/api/rate-limit-ip";
import { successResponse } from "@/lib/api/response";
import { getServerAuthz } from "@/lib/authz/session";
import { isDuffelConfigured } from "@/lib/duffel/config";
import { runStaysFetchAllRates } from "@/lib/services/stays/stays-rates.service";

export const dynamic = "force-dynamic";

const RATES_PER_MINUTE_ANON = 40;
const RATES_PER_MINUTE_AUTH = 120;

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: Params) {
  try {
    if (!isDuffelConfigured()) {
      throw new AppError(503, "Stays are not configured.", "STAYS_NOT_CONFIGURED");
    }

    const { id } = await context.params;
    const searchResultId = decodeURIComponent(id ?? "").trim();
    if (!searchResultId || !/^[a-z]{2,}_[A-Za-z0-9_-]+$/.test(searchResultId)) {
      throw new AppError(400, "Invalid search result id.", "VALIDATION_ERROR");
    }

    const { userId } = await getServerAuthz();
    const ip = clientIpFromHeaders((n) => _req.headers.get(n));
    const limitKey = userId ? `stays-rates:user:${userId}` : `stays-rates:ip:${ip}`;
    const max = userId ? RATES_PER_MINUTE_AUTH : RATES_PER_MINUTE_ANON;
    const rl = rateLimitByKey(limitKey, max);
    if (!rl.ok) {
      throw new AppError(429, "Too many requests. Please wait and try again.", "RATE_LIMITED");
    }

    const payload = await runStaysFetchAllRates(searchResultId);
    return successResponse(payload);
  } catch (e) {
    return handleApiError(e);
  }
}
