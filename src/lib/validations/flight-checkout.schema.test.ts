import { describe, expect, it } from "vitest";
import {
  assertPassengersMatchOffer,
  flightCheckoutBookingBodySchema,
} from "@/lib/validations/flight-checkout.schema";
import type { FlightOfferDTO } from "@/lib/duffel/dto/flight-offer.dto";

const sampleOffer = (pas: string[]): FlightOfferDTO => ({
  id: "off_x",
  total_amount: "100.00",
  total_currency: "USD",
  expires_at: null,
  live_mode: false,
  slices: [],
  passengers: pas.map((id) => ({ id, type: "adult" })),
  available_services: [],
});

describe("flightCheckoutBookingBodySchema", () => {
  it("accepts a minimal valid body", () => {
    const parsed = flightCheckoutBookingBodySchema.safeParse({
      offer_id: "off_abc",
      payment_intent_id: "pit_xyz",
      passengers: [
        {
          passenger_id: "pas_1",
          title: "mr",
          given_name: "John",
          family_name: "Doe",
          born_on: "1990-01-15",
          gender: "m",
          email: "j@example.com",
        },
      ],
    });
    expect(parsed.success).toBe(true);
  });

  it("accepts hold without payment intent", () => {
    const parsed = flightCheckoutBookingBodySchema.safeParse({
      offer_id: "off_abc",
      order_mode: "hold",
      passengers: [
        {
          passenger_id: "pas_1",
          title: "mr",
          given_name: "John",
          family_name: "Doe",
          born_on: "1990-01-15",
          gender: "m",
          email: "j@example.com",
        },
      ],
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects pay_now without payment intent", () => {
    const parsed = flightCheckoutBookingBodySchema.safeParse({
      offer_id: "off_abc",
      order_mode: "pay_now",
      passengers: [
        {
          passenger_id: "pas_1",
          title: "mr",
          given_name: "John",
          family_name: "Doe",
          born_on: "1990-01-15",
          gender: "m",
          email: "j@example.com",
        },
      ],
    });
    expect(parsed.success).toBe(false);
  });
});

describe("assertPassengersMatchOffer", () => {
  it("throws when counts differ", () => {
    const offer = sampleOffer(["pas_a", "pas_b"]);
    expect(() =>
      assertPassengersMatchOffer(offer, [
        {
          passenger_id: "pas_a",
          title: "mr",
          given_name: "A",
          family_name: "B",
          born_on: "1990-01-01",
          gender: "m",
        },
      ]),
    ).toThrow(/match offer passengers/);
  });
});
