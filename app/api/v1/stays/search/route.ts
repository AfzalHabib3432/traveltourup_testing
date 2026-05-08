import { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/error-handler";
import { AppError, ValidationError } from "@/lib/api/errors";
import { clientIpFromHeaders, rateLimitByKey } from "@/lib/api/rate-limit-ip";
import { successResponse } from "@/lib/api/response";
import { getServerAuthz } from "@/lib/authz/session";
import { isDuffelConfigured } from "@/lib/duffel/config";
import { runStaysSearch } from "@/lib/services/stays/stays-search.service";
import { staysSearchBodySchema } from "@/lib/validations/stays.schema";

export const dynamic = "force-dynamic";

const ANON_SEARCH_PER_MINUTE = 25;
const AUTH_SEARCH_PER_MINUTE = 80;

export async function POST(req: NextRequest) {
  try {
    if (!isDuffelConfigured()) {
      throw new AppError(503, "Stays search is not configured.", "STAYS_NOT_CONFIGURED");
    }

    const { userId } = await getServerAuthz();
    const ip = clientIpFromHeaders((n) => req.headers.get(n));
    const limitKey = userId ? `stays-search:user:${userId}` : `stays-search:ip:${ip}`;
    const max = userId ? AUTH_SEARCH_PER_MINUTE : ANON_SEARCH_PER_MINUTE;
    const rl = rateLimitByKey(limitKey, max);
    if (!rl.ok) {
      throw new AppError(429, "Too many hotel searches. Please wait and try again.", "RATE_LIMITED");
    }

    const json = (await req.json()) as unknown;
    const parsed = staysSearchBodySchema.safeParse(json);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues);
    }

    const data = await runStaysSearch(parsed.data);
    return successResponse(data);
  } catch (e) {
    return handleApiError(e);
  }
}
