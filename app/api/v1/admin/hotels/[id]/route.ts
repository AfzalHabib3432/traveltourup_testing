import { NextRequest } from "next/server";
import { getServerAuthz } from "@/lib/authz/session";
import { assertPermission } from "@/lib/authz/server";
import { handleApiError } from "@/lib/api/error-handler";
import { successResponse } from "@/lib/api/response";
import {
  deleteAdminHotel,
  getAdminHotel,
  updateAdminHotel,
} from "@/lib/services/admin/hotel.service";
import { adminHotelIdParamSchema, updateAdminHotelSchema } from "@/lib/validations/admin-hotel.schema";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: RouteContext) {
  try {
    const { authz } = await getServerAuthz();
    assertPermission(authz, "admin.hotels:read");
    const { id } = adminHotelIdParamSchema.parse(await ctx.params);
    const hotel = await getAdminHotel(id);
    return successResponse(hotel);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  try {
    const { authz } = await getServerAuthz();
    assertPermission(authz, "admin.hotels:write");
    const { id } = adminHotelIdParamSchema.parse(await ctx.params);
    const body = await req.json();
    const data = updateAdminHotelSchema.parse(body);
    const hotel = await updateAdminHotel(id, data);
    return successResponse(hotel);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  try {
    const { authz } = await getServerAuthz();
    assertPermission(authz, "admin.hotels:delete");
    const { id } = adminHotelIdParamSchema.parse(await ctx.params);
    await deleteAdminHotel(id);
    return successResponse({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
