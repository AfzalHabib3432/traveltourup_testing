import "server-only";

import { Prisma } from "@/generated/prisma";
import { bookingRepository } from "@/lib/db/repositories/booking.repository";
import { getDuffelOrder } from "@/lib/duffel/orders";
import { staysGetBooking } from "@/lib/duffel/stays-http";
import { prisma } from "@/lib/prisma";

function getOrderObjectFromWebhookPayload(payload: Record<string, unknown>): Record<string, unknown> | null {
  const data = payload.data;
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  const obj = d.object;
  if (!obj || typeof obj !== "object") return null;
  return obj as Record<string, unknown>;
}

function unwrapDuffelOrderResponse(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object") return null;
  const root = raw as Record<string, unknown>;
  const data = root.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }
  return root;
}

function isOrderCancelledInDuffelOrder(order: Record<string, unknown>): boolean {
  if (order.cancelled_at != null) return true;
  const cancel = order.cancellation;
  if (cancel && typeof cancel === "object") {
    const c = cancel as Record<string, unknown>;
    if (typeof c.confirmed_at === "string" && c.confirmed_at.length > 0) return true;
  }
  return false;
}

/**
 * Best-effort sync from Duffel webhook `order.*` events.
 * Idempotent at event level (`DuffelWebhookEvent.event_id` unique).
 */
function getStayBookingIdFromWebhookPayload(payload: Record<string, unknown>): string | null {
  const data = payload.data;
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  const obj = d.object;
  if (!obj || typeof obj !== "object") return null;
  const o = obj as Record<string, unknown>;
  const id = o.id;
  return typeof id === "string" && id.startsWith("bok_") ? id : null;
}

function unwrapDuffelStaysBooking(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object") return null;
  const root = raw as Record<string, unknown>;
  const data = root.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }
  return root;
}

export async function applyDuffelWebhookEventSideEffects(payload: Record<string, unknown>) {
  const type = payload.type;
  if (type === "ping.triggered") return;

  if (typeof type === "string" && type.startsWith("stays.")) {
    const bokId = getStayBookingIdFromWebhookPayload(payload);
    if (!bokId) {
      return;
    }

    const hb = await bookingRepository.findHotelBookingRowByDuffelBookingId(bokId);
    if (!hb) return;

    let bookingObj: Record<string, unknown> | null = null;
    const data = payload.data;
    if (data && typeof data === "object") {
      const obj = (data as Record<string, unknown>).object;
      if (obj && typeof obj === "object") {
        bookingObj = obj as Record<string, unknown>;
      }
    }

    if (!bookingObj || typeof bookingObj.status !== "string") {
      try {
        const fresh = await staysGetBooking(bokId);
        const un = unwrapDuffelStaysBooking(fresh);
        if (un) bookingObj = un;
      } catch {
        /* keep embedded only */
      }
    }

    if (bookingObj) {
      await prisma.hotelBooking.update({
        where: { id: hb.id },
        data: { stays_raw: bookingObj as unknown as Prisma.InputJsonValue },
      });
    }

    if (type === "stays.booking_creation_failed") {
      await prisma.booking.update({
        where: { id: hb.booking_id },
        data: { status: "failed", payment_status: "refund_pending" },
      });
      return;
    }

    const st = bookingObj && typeof bookingObj.status === "string" ? bookingObj.status : null;
    if (st === "cancelled") {
      await prisma.booking.update({
        where: { id: hb.booking_id },
        data: { status: "cancelled", payment_status: "refunded" },
      });
    }
    return;
  }

  if (typeof type !== "string" || !type.startsWith("order.")) return;

  const embedded = getOrderObjectFromWebhookPayload(payload);
  if (!embedded || typeof embedded.id !== "string" || !embedded.id.startsWith("ord_")) {
    return;
  }

  let order = embedded;
  if (typeof embedded.total_amount !== "string") {
    try {
      const fresh = await getDuffelOrder(embedded.id);
      const data = unwrapDuffelOrderResponse(fresh);
      if (data) order = data;
    } catch {
      /* use embedded only */
    }
  }

  const fb = await bookingRepository.findFlightBookingRowByDuffelOrderId(order.id as string);
  if (!fb) return;

  const bookingRef = order.booking_reference;
  await prisma.flightBooking.update({
    where: { id: fb.id },
    data: {
      order_raw: order as unknown as Prisma.InputJsonValue,
      ...(typeof bookingRef === "string" ? { booking_reference: bookingRef } : {}),
    },
  });

  if (isOrderCancelledInDuffelOrder(order)) {
    const bookingRow = await prisma.booking.findUnique({
      where: { id: fb.booking_id },
      select: { status: true },
    });
    if (bookingRow && bookingRow.status !== "cancelled") {
      await prisma.booking.update({
        where: { id: fb.booking_id },
        data: { status: "cancelled", payment_status: "refunded" },
      });
    }
  }
}
