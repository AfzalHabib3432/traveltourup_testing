import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApiError } from "@/lib/api/error-handler";
import { AppError, ValidationError } from "@/lib/api/errors";
import { clientIpFromHeaders, rateLimitByKey } from "@/lib/api/rate-limit-ip";
import { successResponse } from "@/lib/api/response";
import { getServerAuthz } from "@/lib/authz/session";
import { isDuffelConfigured } from "@/lib/duffel/config";
import type { HotelLocationSuggestionDto } from "@/lib/api/stays-places.dto";
import { listDuffelPlaceSuggestions } from "@/lib/duffel/places";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  q: z.string().max(64).optional(),
  limit: z.coerce.number().int().min(1).max(30).optional(),
});

const ANON_PER_MINUTE = 40;
const AUTH_PER_MINUTE = 100;

function mapPlaces(raw: unknown): HotelLocationSuggestionDto[] {
  const rec = raw as { data?: unknown[] };
  if (!Array.isArray(rec.data)) return [];
  const out: HotelLocationSuggestionDto[] = [];
  for (const item of rec.data) {
    if (!item || typeof item !== "object") continue;
    const p = item as Record<string, unknown>;
    const id = typeof p.id === "string" ? p.id : null;
    const name = typeof p.name === "string" ? p.name : null;
    const type = p.type === "city" || p.type === "airport" ? p.type : null;
    if (!id || !name || !type) continue;

    let lat = typeof p.latitude === "number" ? p.latitude : null;
    let lng = typeof p.longitude === "number" ? p.longitude : null;
    const airports = p.airports;
    if ((lat == null || lng == null) && Array.isArray(airports) && airports.length > 0) {
      const a = airports[0] as Record<string, unknown>;
      if (typeof a.latitude === "number") lat = a.latitude;
      if (typeof a.longitude === "number") lng = a.longitude;
    }
    if (lat == null || lng == null) continue;

    const iata = typeof p.iata_code === "string" ? p.iata_code : "";
    if (!iata) continue;

    const city_name = typeof p.city_name === "string" ? p.city_name : undefined;
    const cc = typeof p.iata_country_code === "string" ? p.iata_country_code : undefined;

    out.push({
      id,
      type,
      name,
      city_name,
      iata_code: iata,
      iata_country_code: cc,
      latitude: lat,
      longitude: lng,
    });
  }
  return out;
}

export async function GET(req: NextRequest) {
  try {
    if (!isDuffelConfigured()) {
      throw new AppError(503, "Place lookup is not configured.", "STAYS_NOT_CONFIGURED");
    }

    const { userId } = await getServerAuthz();
    const ip = clientIpFromHeaders((n) => req.headers.get(n));
    const limitKey = userId ? `stays-places:user:${userId}` : `stays-places:ip:${ip}`;
    const max = userId ? AUTH_PER_MINUTE : ANON_PER_MINUTE;
    const rl = rateLimitByKey(limitKey, max);
    if (!rl.ok) {
      throw new AppError(429, "Too many place lookups. Please wait and try again.", "RATE_LIMITED");
    }

    const sp = req.nextUrl.searchParams;
    const parsed = querySchema.safeParse({
      q: sp.get("q") ?? undefined,
      limit: sp.get("limit") ?? undefined,
    });
    if (!parsed.success) throw new ValidationError(parsed.error.issues);

    const q = parsed.data.q?.trim() ?? "";
    if (q.length < 2) {
      return successResponse({ places: [] satisfies never[] });
    }

    const raw = await listDuffelPlaceSuggestions({
      query: q,
      limit: parsed.data.limit,
    });
    const places = mapPlaces(raw);
    return successResponse({ places });
  } catch (e) {
    return handleApiError(e);
  }
}
