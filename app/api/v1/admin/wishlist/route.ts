import type { NextRequest } from "next/server";
import { getServerAuthz } from "@/lib/authz/session";
import { assertPermission } from "@/lib/authz/server";
import { handleApiError } from "@/lib/api/error-handler";
import { paginatedResponse } from "@/lib/api/response";
import { listAllWishlistsForAdmin } from "@/lib/services/wishlist/wishlist.service";
import { adminWishlistListQuerySchema } from "@/lib/validations/wishlist.schema";

export const dynamic = "force-dynamic";

function qp(raw: string | null) {
  return raw === null || raw === "" ? undefined : raw;
}

export async function GET(req: NextRequest) {
  try {
    const { authz } = await getServerAuthz();
    assertPermission(authz, "admin.wishlists:read");

    const { searchParams } = new URL(req.url);
    const query = adminWishlistListQuerySchema.parse({
      page: qp(searchParams.get("page")),
      limit: qp(searchParams.get("limit")),
      user_id: qp(searchParams.get("user_id")),
      type: qp(searchParams.get("type")),
      sort: qp(searchParams.get("sort")),
      order: qp(searchParams.get("order")),
    });

    const { items, total, page, limit } = await listAllWishlistsForAdmin(query);
    return paginatedResponse(items, { total, page, limit });
  } catch (error) {
    return handleApiError(error);
  }
}
