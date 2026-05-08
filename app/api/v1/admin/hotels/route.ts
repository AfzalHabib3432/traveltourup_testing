import { NextRequest } from "next/server";
import { getServerAuthz } from "@/lib/authz/session";
import { assertPermission } from "@/lib/authz/server";
import { handleApiError } from "@/lib/api/error-handler";
import { paginatedResponse, successResponse } from "@/lib/api/response";
import { createAdminHotel, listAdminHotels } from "@/lib/services/admin/hotel.service";
import { adminHotelListQuerySchema, createAdminHotelSchema } from "@/lib/validations/admin-hotel.schema";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { authz } = await getServerAuthz();
    assertPermission(authz, "admin.hotels:read");

    const { searchParams } = new URL(req.url);
    const query = adminHotelListQuerySchema.parse({
      q: searchParams.get("q"),
      status: searchParams.get("status"),
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });

    const { rows, total } = await listAdminHotels(query);
    return paginatedResponse(rows, {
      total,
      page: query.page,
      limit: query.limit,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authz } = await getServerAuthz();
    assertPermission(authz, "admin.hotels:write");

    const body = await req.json();
    const data = createAdminHotelSchema.parse(body);
    const hotel = await createAdminHotel(data);
    return successResponse(hotel, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
