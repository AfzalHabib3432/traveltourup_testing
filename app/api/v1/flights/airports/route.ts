import { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/error-handler";
import { AppError, ValidationError } from "@/lib/api/errors";
import { clientIpFromHeaders, rateLimitByKey } from "@/lib/api/rate-limit-ip";
import { successResponse } from "@/lib/api/response";
import { getServerAuthz } from "@/lib/authz/session";
import { isDuffelConfigured } from "@/lib/duffel/config";
import { listDuffelPlaceSuggestions } from "@/lib/duffel/places";
import { z } from "zod";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  q: z.string().max(64).optional(),
  limit: z.coerce.number().int().min(1).max(30).optional(),
});

const ANON_PER_MINUTE = 40;
const AUTH_PER_MINUTE = 100;

/**
 * Map `GET /places/suggestions` (or legacy airport list) `data[]` into flight autocomplete DTOs.
 * Duffel `/air/airports` does not support text search — use place suggestions for query matching.
 */
function mapAirports(raw: unknown): { iata_code: string; name: string; city_name?: string }[] {
  const rec = raw as { data?: unknown[] };
  if (!Array.isArray(rec.data)) return [];
  const out: { iata_code: string; name: string; city_name?: string }[] = [];
  for (const a of rec.data) {
    if (!a || typeof a !== "object") continue;
    const o = a as Record<string, unknown>;
    const iata = o.iata_code;
    const name = o.name;
    if (typeof iata !== "string" || typeof name !== "string") continue;
    const city = o.city_name;
    out.push({
      iata_code: iata,
      name,
      ...(typeof city === "string" ? { city_name: city } : {}),
    });
  }
  return out;
}

export async function GET(req: NextRequest) {
  try {
    if (!isDuffelConfigured()) {
      throw new AppError(503, "Airport lookup is not configured.", "FLIGHTS_NOT_CONFIGURED");
    }

    const { userId } = await getServerAuthz();
    const ip = clientIpFromHeaders((n) => req.headers.get(n));
    const limitKey = userId ? `flight-airports:user:${userId}` : `flight-airports:ip:${ip}`;
    const max = userId ? AUTH_PER_MINUTE : ANON_PER_MINUTE;
    const rl = rateLimitByKey(limitKey, max);
    if (!rl.ok) {
      throw new AppError(429, "Too many airport lookups. Please wait and try again.", "RATE_LIMITED");
    }

    const sp = req.nextUrl.searchParams;
    const parsed = querySchema.safeParse({
      q: sp.get("q") ?? undefined,
      limit: sp.get("limit") ?? undefined,
    });
    if (!parsed.success) throw new ValidationError(parsed.error.issues);

    const q = parsed.data.q?.trim() ?? "";
    if (q.length < 2) {
      return successResponse({ airports: [] satisfies never[] });
    }

    const raw = await listDuffelPlaceSuggestions({
      query: q,
      limit: parsed.data.limit ?? 22,
    });
    const airports = mapAirports(raw);
    return successResponse({ airports });
  } catch (e) {
    return handleApiError(e);
  }
}
