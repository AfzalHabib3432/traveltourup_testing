import "server-only";

import { AppError } from "@/lib/api/errors";
import {
  confirmFlightCheckoutPaymentIntent,
  createFlightCheckoutPaymentIntent,
} from "@/lib/services/flights/flight-payment-intent.service";
import type { FlightPaymentProviderId, PreparedFlightCheckout } from "@/lib/payments/types";
import type { FlightOrderServiceLine } from "@/lib/validations/flight-ancillaries.schema";

const ALLOWED: FlightPaymentProviderId[] = ["duffel_payments"];

function resolveProvider(): FlightPaymentProviderId {
  const raw = process.env.FLIGHT_PAYMENT_PROVIDER?.trim().toLowerCase();
  if (!raw || raw === "duffel_payments") return "duffel_payments";
  throw new AppError(501, "Unsupported flight payment provider.", "PAYMENT_PROVIDER_UNSUPPORTED");
}

export async function prepareFlightCheckout(input: {
  offerId: string;
  idempotencyKey: string | null;
  services: FlightOrderServiceLine[];
}): Promise<PreparedFlightCheckout> {
  const provider = resolveProvider();
  if (!ALLOWED.includes(provider)) {
    throw new AppError(501, "Unsupported flight payment provider.", "PAYMENT_PROVIDER_UNSUPPORTED");
  }
  const data = await createFlightCheckoutPaymentIntent(input);
  return {
    provider,
    payment_intent_id: data.payment_intent_id,
    client_token: data.client_token,
    status: data.status,
    offer_id: data.offer_id,
    pricing: data.pricing,
    idempotent_replay: data.idempotent_replay,
    pricing_detail: "pricing_detail" in data ? data.pricing_detail : undefined,
  };
}

export async function confirmFlightCheckout(provider: FlightPaymentProviderId, paymentIntentId: string) {
  if (provider !== "duffel_payments") {
    throw new AppError(501, "Unsupported flight payment provider.", "PAYMENT_PROVIDER_UNSUPPORTED");
  }
  return confirmFlightCheckoutPaymentIntent(paymentIntentId);
}
