import { z } from "zod";
import { AppError } from "@/lib/api/errors";
import type { FlightOfferDTO } from "@/lib/duffel/dto/flight-offer.dto";
import { flightOrderServicesSchema } from "@/lib/validations/flight-ancillaries.schema";

const duffelTitle = z.enum(["mr", "mrs", "ms", "miss", "dr"]);

export const flightCheckoutPassengerSchema = z.object({
  passenger_id: z.string().regex(/^pas_/),
  title: duffelTitle,
  given_name: z.string().min(1).max(64),
  family_name: z.string().min(1).max(64),
  born_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(["m", "f"]),
  email: z.string().email().max(128).optional(),
  phone_number: z.string().min(5).max(32).optional(),
  infant_passenger_id: z.string().regex(/^pas_/).optional(),
});

export const flightCheckoutBookingBodySchema = z
  .object({
    offer_id: z.string().min(1).max(128),
    /** Required when `order_mode` is `pay_now` (default). Omit for `hold`. */
    payment_intent_id: z.string().regex(/^pit_/).optional(),
    /** `hold` creates a Duffel hold order without PaymentIntent (behind `FLIGHT_HOLD_BACKEND`). */
    order_mode: z.enum(["pay_now", "hold"]).optional().default("pay_now"),
    passengers: z.array(flightCheckoutPassengerSchema).min(1),
    services: flightOrderServicesSchema.optional().default([]),
  })
  .superRefine((data, ctx) => {
    const mode = data.order_mode ?? "pay_now";
    if (mode === "pay_now" && !data.payment_intent_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "payment_intent_id is required for pay_now orders",
        path: ["payment_intent_id"],
      });
    }
    if (mode === "hold" && data.payment_intent_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "payment_intent_id must not be set for hold orders",
        path: ["payment_intent_id"],
      });
    }
  });

export type FlightCheckoutBookingBody = z.infer<typeof flightCheckoutBookingBodySchema>;

/** Ensures each offer passenger has exactly one checkout row and ids match. */
export function assertPassengersMatchOffer(
  offer: FlightOfferDTO,
  passengers: FlightCheckoutBookingBody["passengers"],
): void {
  const offerIds = new Set(offer.passengers.map((p) => p.id).sort());
  const bodyIds = new Set(passengers.map((p) => p.passenger_id).sort());
  if (offerIds.size === 0) {
    throw new AppError(400, "Offer has no passengers; cannot book.", "VALIDATION_ERROR");
  }
  if (offerIds.size !== bodyIds.size || ![...offerIds].every((id) => bodyIds.has(id))) {
    throw new AppError(
      400,
      "Passenger list must match offer passengers exactly.",
      "PASSENGER_MISMATCH",
    );
  }
}
