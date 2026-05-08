import { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/error-handler";
import { AppError, ValidationError } from "@/lib/api/errors";
import { clientIpFromHeaders, rateLimitByKey } from "@/lib/api/rate-limit-ip";
import { successResponse } from "@/lib/api/response";
import { getServerAuthz } from "@/lib/authz/session";
import { isDuffelConfigured } from "@/lib/duffel/config";
import { runStaysCreateQuote } from "@/lib/services/stays/stays-quote.service";
import { staysQuoteBodySchema } from "@/lib/validations/stays.schema";

export const dynamic = "force-dynamic";

const QUOTE_PER_MINUTE = 30;

export async function POST(req: NextRequest) {
  try {
    if (!isDuffelConfigured()) {
      throw new AppError(503, "Stays are not configured.", "STAYS_NOT_CONFIGURED");
    }

    const { userId } = await getServerAuthz();
    const ip = clientIpFromHeaders((n) => req.headers.get(n));
    const limitKey = userId ? `stays-quote:user:${userId}` : `stays-quote:ip:${ip}`;
    const rl = rateLimitByKey(limitKey, QUOTE_PER_MINUTE);
    if (!rl.ok) {
      throw new AppError(429, "Too many quote requests. Please wait.", "RATE_LIMITED");
    }

    const json = (await req.json()) as unknown;
    const parsed = staysQuoteBodySchema.safeParse(json);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues);
    }

    const quote = await runStaysCreateQuote(parsed.data.rate_id);
    return successResponse(quote);
  } catch (e) {
    return handleApiError(e);
  }
}
