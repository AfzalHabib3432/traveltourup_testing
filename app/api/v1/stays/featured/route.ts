import { handleApiError } from "@/lib/api/error-handler";
import { successResponse } from "@/lib/api/response";
import { getCachedFeaturedStaysCards } from "@/lib/services/stays/featured-stays.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cards = await getCachedFeaturedStaysCards();
    return successResponse({ cards, count: cards.length });
  } catch (e) {
    return handleApiError(e);
  }
}
