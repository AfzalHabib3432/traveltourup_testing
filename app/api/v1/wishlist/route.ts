import type { NextRequest } from "next/server";
import { getServerAuthz } from "@/lib/authz/session";
import { requireUserId } from "@/lib/authz/server";
import { handleApiError } from "@/lib/api/error-handler";
import { successResponse } from "@/lib/api/response";
import {
  deleteWishlistItemForUser,
  listWishlistForUser,
  upsertWishlistItemForUser,
} from "@/lib/services/wishlist/wishlist.service";
import {
  deleteWishlistQuerySchema,
  upsertWishlistItemSchema,
  wishlistListQuerySchema,
} from "@/lib/validations/wishlist.schema";
import { NotFoundError } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

function qp(raw: string | null) {
  return raw === null || raw === "" ? undefined : raw;
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await getServerAuthz();
    await requireUserId(userId);

    const { searchParams } = new URL(req.url);
    const query = wishlistListQuerySchema.parse({
      type: qp(searchParams.get("type")),
    });

    const items = await listWishlistForUser(userId!, query);
    return successResponse(items);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await getServerAuthz();
    await requireUserId(userId);

    const body = await req.json();
    const data = upsertWishlistItemSchema.parse(body);
    const item = await upsertWishlistItemForUser(userId!, data);
    return successResponse(item, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await getServerAuthz();
    await requireUserId(userId);

    const { searchParams } = new URL(req.url);
    const query = deleteWishlistQuerySchema.parse({
      type: qp(searchParams.get("type")),
      ref_id: qp(searchParams.get("ref_id")),
    });

    const { deleted } = await deleteWishlistItemForUser(userId!, query.type, query.ref_id);
    if (!deleted) {
      throw new NotFoundError("Wishlist item");
    }
    return successResponse({ ok: true as const });
  } catch (error) {
    return handleApiError(error);
  }
}
