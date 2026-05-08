import { NextRequest } from "next/server";
import { getServerAuthz } from "@/lib/authz/session";
import { assertPermission } from "@/lib/authz/server";
import { handleApiError } from "@/lib/api/error-handler";
import { successResponse } from "@/lib/api/response";
import {
  deleteAdminCar,
  getAdminCar,
  updateAdminCar,
} from "@/lib/services/admin/car.service";
import { adminCarIdParamSchema, updateAdminCarSchema } from "@/lib/validations/admin-car.schema";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: RouteContext) {
  try {
    const { authz } = await getServerAuthz();
    assertPermission(authz, "admin.cars:read");
    const { id } = adminCarIdParamSchema.parse(await ctx.params);
    const car = await getAdminCar(id);
    return successResponse(car);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  try {
    const { authz } = await getServerAuthz();
    assertPermission(authz, "admin.cars:write");
    const { id } = adminCarIdParamSchema.parse(await ctx.params);
    const body = await req.json();
    const data = updateAdminCarSchema.parse(body);
    const car = await updateAdminCar(id, data);
    return successResponse(car);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  try {
    const { authz } = await getServerAuthz();
    assertPermission(authz, "admin.cars:delete");
    const { id } = adminCarIdParamSchema.parse(await ctx.params);
    await deleteAdminCar(id);
    return successResponse({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
