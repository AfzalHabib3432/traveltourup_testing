import { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/error-handler";
import { AppError, ValidationError } from "@/lib/api/errors";
import { successResponse } from "@/lib/api/response";
import { requireUserId } from "@/lib/authz/server";
import { getServerAuthz } from "@/lib/authz/session";
import { isDuffelConfigured } from "@/lib/duffel/config";
import { createDuffelStayBooking } from "@/lib/services/stays/stays-booking.service";
import { staysBookingBodySchema } from "@/lib/validations/stays.schema";

export const dynamic = "force-dynamic";

const BOOKING_IDEMPOTENCY_HEADER = "idempotency-key";

export async function POST(req: NextRequest) {
  try {
    if (!isDuffelConfigured()) {
      throw new AppError(503, "Stays bookings are not configured.", "STAYS_NOT_CONFIGURED");
    }

    const { userId, authz } = await getServerAuthz();
    const uid = await requireUserId(userId);

    const json = (await req.json()) as unknown;
    const parsed = staysBookingBodySchema.safeParse(json);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues);
    }

    const idem = req.headers.get(BOOKING_IDEMPOTENCY_HEADER)?.trim() || null;
    if (idem && idem.length > 128) {
      throw new AppError(400, "Idempotency-Key is too long.", "VALIDATION_ERROR");
    }

    const booking = await createDuffelStayBooking({
      authz,
      userId: uid,
      body: parsed.data,
      idempotencyKey: idem,
    });

    return successResponse(booking, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
