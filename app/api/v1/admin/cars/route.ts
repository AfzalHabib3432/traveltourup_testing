import { NextRequest } from "next/server";
import { getServerAuthz } from "@/lib/authz/session";
import { assertPermission } from "@/lib/authz/server";
import { handleApiError } from "@/lib/api/error-handler";
import { paginatedResponse, successResponse } from "@/lib/api/response";
import { createAdminCar, listAdminCars } from "@/lib/services/admin/car.service";
import { adminCarListQuerySchema, createAdminCarSchema } from "@/lib/validations/admin-car.schema";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { authz } = await getServerAuthz();
    assertPermission(authz, "admin.cars:read");

    const { searchParams } = new URL(req.url);
    const query = adminCarListQuerySchema.parse({
      q: searchParams.get("q"),
      status: searchParams.get("status"),
      airport_code: searchParams.get("airport_code"),
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });

    const result = await listAdminCars(query);
    return paginatedResponse(result.items, {
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authz } = await getServerAuthz();
    assertPermission(authz, "admin.cars:write");

    const body = await req.json();
    const data = createAdminCarSchema.parse(body);
    const car = await createAdminCar(data);
    return successResponse(car, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
