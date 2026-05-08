import "server-only";

import { unstable_cache } from "next/cache";
import { isDuffelConfigured } from "@/lib/duffel/config";
import { duffelStaysSearch } from "@/lib/duffel/stays";
import { parseStaysSearchResults } from "@/lib/duffel/stays-parse";
import type { StaysSearchResultCard } from "@/lib/api/stays-dto";
import {
  FEATURED_STAYS_CARD_LIMIT,
  FEATURED_STAYS_GUESTS,
  FEATURED_STAYS_LOCATION,
  FEATURED_STAYS_REVALIDATE_SECONDS,
  FEATURED_STAYS_ROOMS,
} from "@/config/featured-stays";

function featuredDateRange() {
  const checkIn = new Date();
  checkIn.setUTCDate(checkIn.getUTCDate() + 14);
  const checkOut = new Date(checkIn);
  checkOut.setUTCDate(checkOut.getUTCDate() + 2);
  return {
    check_in_date: checkIn.toISOString().slice(0, 10),
    check_out_date: checkOut.toISOString().slice(0, 10),
  };
}

async function loadFeaturedStaysUncached(): Promise<StaysSearchResultCard[]> {
  if (!isDuffelConfigured()) return [];

  const { check_in_date, check_out_date } = featuredDateRange();
  try {
    const raw = await duffelStaysSearch({
      check_in_date,
      check_out_date,
      rooms: FEATURED_STAYS_ROOMS,
      guests: [...FEATURED_STAYS_GUESTS],
      location: { ...FEATURED_STAYS_LOCATION },
    });
    const results = parseStaysSearchResults(raw);
    return results.slice(0, FEATURED_STAYS_CARD_LIMIT);
  } catch (e) {
    console.error("Featured stays load failed:", e instanceof Error ? e.message : e);
    return [];
  }
}

export async function getCachedFeaturedStaysCards(): Promise<StaysSearchResultCard[]> {
  return unstable_cache(
    () => loadFeaturedStaysUncached(),
    ["featured-stays-cards-v1"],
    { revalidate: FEATURED_STAYS_REVALIDATE_SECONDS },
  )();
}
