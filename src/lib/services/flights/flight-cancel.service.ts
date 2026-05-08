import "server-only";

import { Prisma } from "@/generated/prisma";
import { AppError } from "@/lib/api/errors";
import { ForbiddenError } from "@/lib/authz/errors";
import { hasPermission, type AuthzContext } from "@/lib/authz";
import { bookingRepository } from "@/lib/db/repositories/booking.repository";
import { parseDuffelOrderCancellationResponse } from "@/lib/duffel/order-cancellation-parse";
import { confirmOrderCancellation, createOrderCancellation } from "@/lib/duffel/order-cancellations";
import { DuffelApiError } from "@/lib/duffel/errors";
import { prisma } from "@/lib/prisma";
import { serializeBookingResponse } from "@/lib/services/booking.service";
import type { FlightBookingCancelBody } from "@/lib/validations/flight-cancel.schema";

function assertCanCancelFlightBooking(input: {
  authz: AuthzContext | null;
  userId: string;
  bookingUserId: string | null;
}) {
  if (!input.authz) throw new ForbiddenError();
  if (hasPermission(input.authz, "bookings:manage")) return;
  if (
    input.bookingUserId === input.userId &&
    hasPermission(input.authz, "bookings:cancel_own")
  ) {
    return;
  }
  throw new ForbiddenError();
}

function paymentStatusAfterCancel(
  bookingTotal: Prisma.Decimal,
  refundAmount: string | null,
): "refunded" | "partially_refunded" {
  if (refundAmount == null || refundAmount === "") return "partially_refunded";
  const r = Number.parseFloat(refundAmount);
  const t = Number.parseFloat(bookingTotal.toString());
  if (!Number.isFinite(r) || !Number.isFinite(t)) return "partially_refunded";
  if (r + 0.005 >= t) return "refunded";
  return "partially_refunded";
}

function cancellationToApi(row: {
  duffel_cancellation_id: string;
  duffel_order_id: string;
  status: string;
  refund_amount: string | null;
  refund_currency: string | null;
  refund_to: string | null;
  quote_expires_at: Date | null;
  confirmed_at: Date | null;
}) {
  return {
    order_cancellation_id: row.duffel_cancellation_id,
    order_id: row.duffel_order_id,
    status: row.status,
    refund_amount: row.refund_amount,
    refund_currency: row.refund_currency,
    refund_to: row.refund_to,
    quote_expires_at: row.quote_expires_at?.toISOString() ?? null,
    confirmed_at: row.confirmed_at?.toISOString() ?? null,
  };
}

export async function processDuffelFlightBookingCancel(input: {
  authz: AuthzContext | null;
  userId: string;
  bookingId: string;
  body: FlightBookingCancelBody;
}) {
  const row = await bookingRepository.findById(input.bookingId);
  if (!row) {
    throw new AppError(404, "Booking not found.", "NOT_FOUND");
  }

  assertCanCancelFlightBooking({
    authz: input.authz,
    userId: input.userId,
    bookingUserId: row.user_id,
  });

  if (row.type !== "flight" || !row.flightBooking) {
    throw new AppError(400, "Only flight bookings support Duffel cancellation.", "VALIDATION_ERROR");
  }

  const fb = row.flightBooking;
  const duffelOrderId = fb.duffel_order_id;
  if (!duffelOrderId) {
    throw new AppError(400, "This booking has no Duffel order.", "VALIDATION_ERROR");
  }

  if (row.status === "cancelled") {
    throw new AppError(409, "Booking is already cancelled.", "BOOKING_ALREADY_CANCELLED");
  }

  if (row.status !== "confirmed") {
    throw new AppError(409, "Only confirmed bookings can be cancelled via Duffel.", "BOOKING_NOT_CANCELLABLE");
  }

  if (input.body.action === "quote") {
    const now = new Date();
    const pending = await bookingRepository.findLatestPendingOrderCancellation(fb.id);
    if (pending && pending.status === "pending") {
      if (pending.quote_expires_at && pending.quote_expires_at < now) {
        await prisma.flightOrderCancellation.update({
          where: { id: pending.id },
          data: { status: "expired" },
        });
      } else {
        return {
          action: "quote" as const,
          order_cancellation: cancellationToApi(pending),
        };
      }
    }

    let raw: unknown;
    try {
      raw = await createOrderCancellation(duffelOrderId);
    } catch (e) {
      if (e instanceof DuffelApiError) {
        throw new AppError(
          502,
          e.clientMessage || "Could not get cancellation quote from airline.",
          "UPSTREAM_ERROR",
        );
      }
      throw e;
    }

    const parsed = parseDuffelOrderCancellationResponse(raw);
    const status = parsed.confirmedAt ? "confirmed" : "pending";

    await bookingRepository.supersedePendingOrderCancellations(fb.id);

    await prisma.flightOrderCancellation.create({
      data: {
        flight_booking_id: fb.id,
        duffel_cancellation_id: parsed.duffelCancellationId,
        duffel_order_id: parsed.duffelOrderId,
        status,
        refund_amount: parsed.refundAmount,
        refund_currency: parsed.refundCurrency,
        refund_to: parsed.refundTo,
        quote_expires_at: parsed.quoteExpiresAt,
        confirmed_at: parsed.confirmedAt,
        raw: parsed.raw as unknown as Prisma.InputJsonValue,
      },
    });

    const created = await prisma.flightOrderCancellation.findUniqueOrThrow({
      where: { duffel_cancellation_id: parsed.duffelCancellationId },
    });

    if (parsed.confirmedAt) {
      const payStatus = paymentStatusAfterCancel(row.total_amount, parsed.refundAmount);
      await prisma.$transaction([
        prisma.flightBooking.update({
          where: { id: fb.id },
          data: { order_raw: parsed.raw as unknown as Prisma.InputJsonValue },
        }),
        prisma.booking.update({
          where: { id: row.id },
          data: { status: "cancelled", payment_status: payStatus },
        }),
      ]);
    }

    return {
      action: "quote" as const,
      order_cancellation: cancellationToApi(created),
    };
  }

  const { order_cancellation_id: oreId } = input.body;

  const oc = await prisma.flightOrderCancellation.findFirst({
    where: {
      duffel_cancellation_id: oreId,
      flight_booking_id: fb.id,
    },
  });

  if (!oc) {
    throw new AppError(400, "Cancellation quote not found for this booking.", "NOT_FOUND");
  }

  if (oc.status !== "pending") {
    throw new AppError(409, "This cancellation was already confirmed or is no longer valid.", "CANCELLATION_INVALID");
  }

  if (oc.quote_expires_at && oc.quote_expires_at < new Date()) {
    await prisma.flightOrderCancellation.update({
      where: { id: oc.id },
      data: { status: "expired" },
    });
    throw new AppError(410, "Cancellation quote expired. Request a new quote.", "QUOTE_EXPIRED");
  }

  let raw: unknown;
  try {
    raw = await confirmOrderCancellation(oreId);
  } catch (e) {
    if (e instanceof DuffelApiError) {
      throw new AppError(
        502,
        e.clientMessage || "Airline could not confirm cancellation.",
        "UPSTREAM_ERROR",
      );
    }
    throw e;
  }

  const parsed = parseDuffelOrderCancellationResponse(raw);
  const payStatus = paymentStatusAfterCancel(row.total_amount, parsed.refundAmount);

  await prisma.$transaction([
    prisma.flightOrderCancellation.update({
      where: { id: oc.id },
      data: {
        status: "confirmed",
        refund_amount: parsed.refundAmount,
        refund_currency: parsed.refundCurrency,
        refund_to: parsed.refundTo,
        confirmed_at: parsed.confirmedAt ?? new Date(),
        raw: parsed.raw as unknown as Prisma.InputJsonValue,
      },
    }),
    prisma.flightBooking.update({
      where: { id: fb.id },
      data: {
        order_raw: parsed.raw as unknown as Prisma.InputJsonValue,
      },
    }),
    prisma.booking.update({
      where: { id: row.id },
      data: {
        status: "cancelled",
        payment_status: payStatus,
      },
    }),
  ]);

  const updated = await bookingRepository.findById(row.id);
  if (!updated) {
    throw new AppError(500, "Booking disappeared after cancel.", "INTERNAL_ERROR");
  }

  return {
    action: "confirm" as const,
    order_cancellation: cancellationToApi({
      ...oc,
      status: "confirmed",
      refund_amount: parsed.refundAmount,
      refund_currency: parsed.refundCurrency,
      refund_to: parsed.refundTo,
      quote_expires_at: oc.quote_expires_at,
      confirmed_at: parsed.confirmedAt ?? new Date(),
      duffel_cancellation_id: oc.duffel_cancellation_id,
      duffel_order_id: oc.duffel_order_id,
    }),
    booking: serializeBookingResponse(updated),
  };
}
