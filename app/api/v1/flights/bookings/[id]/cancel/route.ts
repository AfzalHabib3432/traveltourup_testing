import { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/error-handler";
import { AppError, ValidationError } from "@/lib/api/errors";
import { successResponse } from "@/lib/api/response";
import { requireUserId } from "@/lib/authz/server";
import { getServerAuthz } from "@/lib/authz/session";
import { isDuffelConfigured } from "@/lib/duffel/config";
import { processDuffelFlightBookingCancel } from "@/lib/services/flights/flight-cancel.service";
import { flightBookingCancelBodySchema } from "@/lib/validations/flight-cancel.schema";
import { bookingIdParamSchema } from "@/lib/validations/booking.schema";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    if (!isDuffelConfigured()) {
      throw new AppError(503, "Flight bookings are not configured.", "FLIGHTS_NOT_CONFIGURED");
    }

    const { userId, authz } = await getServerAuthz();
    const uid = await requireUserId(userId);

    const { id } = bookingIdParamSchema.parse(await context.params);

    const json = (await req.json()) as unknown;
    const parsed = flightBookingCancelBodySchema.safeParse(json);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues);
    }

    const result = await processDuffelFlightBookingCancel({
      authz,
      userId: uid,
      bookingId: id,
      body: parsed.data,
    });

    return successResponse(result, 200);
  } catch (e) {
    return handleApiError(e);
  }
}
