import "server-only";

/** When a booking is persisted and you have a guest email, call `sendEmail({ type: "booking_confirmation", ... })` from `@/lib/email` (or `POST /api/email/send` with `EMAIL_SERVER_SECRET`) to notify the traveler. */

import { randomBytes } from "crypto";
import { Prisma } from "@/generated/prisma";
import {
  BookingFailedAfterPaymentError,
  AppError,
  PriceChangedError,
} from "@/lib/api/errors";
import { getFlightPaymentsConfig } from "@/config/flight-payments.config";
import { isFlightHoldOrderBackendEnabled } from "@/config/flight-hold.config";
import {
  parseDuffelOrderResponse,
  parseDuffelOrderServicesForDb,
} from "@/lib/duffel/order-parse";
import { createOrder } from "@/lib/duffel/orders";
import { DuffelApiError } from "@/lib/duffel/errors";
import { bookingRepository } from "@/lib/db/repositories/booking.repository";
import { flightPaymentIntentRepository } from "@/lib/db/repositories/flight-payment-intent.repository";
import { serializeBookingResponse } from "@/lib/services/booking.service";
import {
  encodeAncillarySelection,
  parseAncillarySelectionJson,
  validateAndPriceOrderServices,
} from "@/lib/services/flights/flight-ancillaries.service";
import { refreshFlightOffer } from "@/lib/services/flights/flights-offer.service";
import type { FlightCheckoutBookingBody } from "@/lib/validations/flight-checkout.schema";
import { assertPassengersMatchOffer } from "@/lib/validations/flight-checkout.schema";
import { hasPermission, type AuthzContext } from "@/lib/authz";
import { ForbiddenError } from "@/lib/authz/errors";

function bookingRef(): string {
  const t = Date.now().toString(36);
  const r = randomBytes(4).toString("hex");
  return `TTU-${t}-${r}`.toUpperCase();
}

function toDuffelOrderPassengers(passengers: FlightCheckoutBookingBody["passengers"]) {
  return passengers.map((p) => {
    const row: Record<string, unknown> = {
      id: p.passenger_id,
      title: p.title,
      given_name: p.given_name,
      family_name: p.family_name,
      born_on: p.born_on,
      gender: p.gender,
    };
    if (p.email) row.email = p.email;
    if (p.phone_number) row.phone_number = p.phone_number;
    if (p.infant_passenger_id) row.infant_passenger_id = p.infant_passenger_id;
    return row;
  });
}

export async function createDuffelInstantFlightBooking(input: {
  authz: AuthzContext | null;
  userId: string;
  body: FlightCheckoutBookingBody;
  idempotencyKey: string | null;
}) {
  if (!input.authz || !hasPermission(input.authz, "bookings:create")) {
    throw new ForbiddenError();
  }

  if (input.idempotencyKey) {
    const existing = await bookingRepository.findByIdempotencyKey(input.idempotencyKey);
    if (existing) {
      return serializeBookingResponse(existing);
    }
  }

  const pitId = input.body.payment_intent_id;
  if (!pitId) {
    throw new AppError(400, "Missing payment intent.", "VALIDATION_ERROR");
  }

  const pit = await flightPaymentIntentRepository.findByDuffelIntentId(pitId);
  if (!pit) {
    throw new AppError(400, "Unknown payment intent. Start checkout again.", "VALIDATION_ERROR");
  }
  if (pit.offer_id !== input.body.offer_id) {
    throw new AppError(400, "Offer does not match payment intent.", "VALIDATION_ERROR");
  }
  if (pit.booking_id) {
    const existingBooking = await bookingRepository.findById(pit.booking_id);
    if (existingBooking) return serializeBookingResponse(existingBooking);
  }

  const statusNorm = pit.status.toLowerCase();
  if (statusNorm !== "succeeded") {
    throw new AppError(400, "Payment is not complete.", "PAYMENT_INCOMPLETE");
  }

  const pitSel = encodeAncillarySelection(parseAncillarySelectionJson(pit.ancillary_selection));
  const bodySel = encodeAncillarySelection(input.body.services);
  if (pitSel !== bodySel) {
    throw new AppError(400, "Extras do not match this payment session.", "VALIDATION_ERROR");
  }

  const payConfig = getFlightPaymentsConfig();
  const offer = await refreshFlightOffer(input.body.offer_id);

  const refreshed = Number.parseFloat(offer.total_amount);
  const snap = Number.parseFloat(pit.offer_amount);
  if (
    !Number.isFinite(refreshed) ||
    !Number.isFinite(snap) ||
    Math.abs(refreshed - snap) > payConfig.priceToleranceMajor
  ) {
    throw new PriceChangedError();
  }

  const priced = await validateAndPriceOrderServices({
    offerId: input.body.offer_id,
    services: input.body.services,
    offerTotalCurrency: offer.total_currency,
  });
  if (priced.currency !== offer.total_currency) {
    throw new AppError(400, "Extras currency does not match offer.", "VALIDATION_ERROR");
  }
  const snapSvc = Number.parseFloat(pit.services_subtotal_amount ?? "0");
  const nowSvc = Number.parseFloat(priced.servicesSubtotal);
  if (
    !Number.isFinite(snapSvc) ||
    !Number.isFinite(nowSvc) ||
    Math.abs(nowSvc - snapSvc) > payConfig.priceToleranceMajor
  ) {
    throw new PriceChangedError();
  }

  assertPassengersMatchOffer(offer, input.body.passengers);

  const orderTotal = (refreshed + nowSvc).toFixed(2);

  const orderBody: Record<string, unknown> = {
    type: "instant",
    selected_offers: [offer.id],
    payments: [
      {
        type: "balance",
        amount: orderTotal,
        currency: offer.total_currency,
      },
    ],
    metadata: { payment_intent_id: pit.duffel_intent_id },
    passengers: toDuffelOrderPassengers(input.body.passengers),
  };
  if (priced.orderServices.length > 0) {
    orderBody.services = priced.orderServices;
  }

  let raw: unknown;
  try {
    raw = await createOrder(orderBody);
  } catch (e) {
    if (e instanceof DuffelApiError) {
      throw new BookingFailedAfterPaymentError(
        "Payment was received but the airline could not confirm this booking. Please contact support with your payment reference.",
        pit.duffel_intent_id,
        pit.duffel_intent_id,
      );
    }
    throw e;
  }

  const parsed = parseDuffelOrderResponse(raw);
  const expiresAt = offer.expires_at ? new Date(offer.expires_at) : null;
  const ancillaries = parseDuffelOrderServicesForDb(parsed.data);

  const guestData = {
    offer_id: offer.id,
    payment_intent_id: pit.duffel_intent_id,
    passengers: input.body.passengers,
    services: input.body.services,
    customer_charge: { amount: pit.charge_amount, currency: pit.charge_currency },
  };

  const row = await bookingRepository.createFlightBookingFromDuffelOrder({
    booking_ref_no: bookingRef(),
    user_id: input.userId,
    type: "flight",
    status: "confirmed",
    payment_status: "paid",
    total_amount: new Prisma.Decimal(parsed.totalAmount),
    currency: parsed.totalCurrency,
    guest_data: guestData as unknown as Prisma.InputJsonValue,
    idempotency_key: input.idempotencyKey,
    linkDuffelPaymentIntentId: pit.duffel_intent_id,
    ancillaries,
    flight: {
      duffel_order_id: parsed.orderId,
      duffel_offer_id: offer.id,
      booking_reference: parsed.bookingReference,
      live_mode: parsed.liveMode,
      last_offer_total_amount: new Prisma.Decimal(offer.total_amount),
      last_offer_total_currency: offer.total_currency,
      offer_expires_at: expiresAt && !Number.isNaN(expiresAt.getTime()) ? expiresAt : null,
      itinerary_snapshot: offer as unknown as Prisma.InputJsonValue,
      order_raw: parsed.data as unknown as Prisma.InputJsonValue,
    },
  });

  return serializeBookingResponse(row);
}

/** Duffel `type: "hold"` — gated by `FLIGHT_HOLD_BACKEND` / `NEXT_PUBLIC_FLIGHT_HOLD_BACKEND`. */
export async function createDuffelHoldFlightBooking(input: {
  authz: AuthzContext | null;
  userId: string;
  body: FlightCheckoutBookingBody;
  idempotencyKey: string | null;
}) {
  if (!isFlightHoldOrderBackendEnabled()) {
    throw new AppError(503, "Hold bookings are not enabled on this environment.", "HOLD_DISABLED");
  }

  if (!input.authz || !hasPermission(input.authz, "bookings:create")) {
    throw new ForbiddenError();
  }

  if (input.idempotencyKey) {
    const existing = await bookingRepository.findByIdempotencyKey(input.idempotencyKey);
    if (existing) {
      return serializeBookingResponse(existing);
    }
  }

  const offer = await refreshFlightOffer(input.body.offer_id);

  const priced = await validateAndPriceOrderServices({
    offerId: input.body.offer_id,
    services: input.body.services,
    offerTotalCurrency: offer.total_currency,
  });
  if (priced.currency !== offer.total_currency) {
    throw new AppError(400, "Extras currency does not match offer.", "VALIDATION_ERROR");
  }

  assertPassengersMatchOffer(offer, input.body.passengers);

  const orderBody: Record<string, unknown> = {
    type: "hold",
    selected_offers: [offer.id],
    passengers: toDuffelOrderPassengers(input.body.passengers),
  };
  if (priced.orderServices.length > 0) {
    orderBody.services = priced.orderServices;
  }

  let raw: unknown;
  try {
    raw = await createOrder(orderBody);
  } catch (e) {
    if (e instanceof DuffelApiError) {
      throw new AppError(
        502,
        "The airline could not place a hold on this offer. Try again or choose Pay now.",
        "HOLD_ORDER_FAILED",
      );
    }
    throw e;
  }

  const parsed = parseDuffelOrderResponse(raw);
  const expiresAt = offer.expires_at ? new Date(offer.expires_at) : null;
  const ancillaries = parseDuffelOrderServicesForDb(parsed.data);

  const guestData = {
    offer_id: offer.id,
    order_mode: "hold",
    passengers: input.body.passengers,
    services: input.body.services,
  };

  const row = await bookingRepository.createFlightBookingFromDuffelOrder({
    booking_ref_no: bookingRef(),
    user_id: input.userId,
    type: "flight",
    status: "pending",
    payment_status: "unpaid",
    total_amount: new Prisma.Decimal(parsed.totalAmount),
    currency: parsed.totalCurrency,
    guest_data: guestData as unknown as Prisma.InputJsonValue,
    idempotency_key: input.idempotencyKey,
    linkDuffelPaymentIntentId: null,
    ancillaries,
    flight: {
      duffel_order_id: parsed.orderId,
      duffel_offer_id: offer.id,
      booking_reference: parsed.bookingReference,
      live_mode: parsed.liveMode,
      last_offer_total_amount: new Prisma.Decimal(offer.total_amount),
      last_offer_total_currency: offer.total_currency,
      offer_expires_at: expiresAt && !Number.isNaN(expiresAt.getTime()) ? expiresAt : null,
      itinerary_snapshot: offer as unknown as Prisma.InputJsonValue,
      order_raw: parsed.data as unknown as Prisma.InputJsonValue,
    },
  });

  return serializeBookingResponse(row);
}
