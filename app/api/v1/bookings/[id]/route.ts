import { NextRequest } from "next/server";
import { getServerAuthz } from "@/lib/authz/session";
import { requireUserId } from "@/lib/authz/server";
import { handleApiError } from "@/lib/api/error-handler";
import { successResponse } from "@/lib/api/response";
import { deleteBooking, getBookingById, patchBooking } from "@/lib/services/booking.service";
import { bookingIdParamSchema, patchBookingSchema } from "@/lib/validations/booking.schema";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: RouteContext) {
  try {
    const { userId, authz } = await getServerAuthz();
    await requireUserId(userId);
    const { id } = bookingIdParamSchema.parse(await ctx.params);

    const booking = await getBookingById({
      authz,
      requestingUserId: userId!,
      id,
    });
    return successResponse(booking);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  try {
    const { userId, authz } = await getServerAuthz();
    await requireUserId(userId);
    const { id } = bookingIdParamSchema.parse(await ctx.params);
    const body = await req.json();
    const data = patchBookingSchema.parse(body);

    const booking = await patchBooking({
      authz,
      requestingUserId: userId!,
      id,
      body: data,
    });
    return successResponse(booking);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  try {
    const { userId, authz } = await getServerAuthz();
    await requireUserId(userId);
    const { id } = bookingIdParamSchema.parse(await ctx.params);

    await deleteBooking({ authz, id });
    return successResponse({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
