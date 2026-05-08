/**
 * Duffel Payments (PaymentIntent → Balance) adapter for flight checkout.
 * Future PSPs (e.g. PayPal) should live alongside this module with the same orchestration pattern.
 */
export {
  prepareFlightCheckout,
  confirmFlightCheckout,
} from "@/lib/payments/flight-payment-orchestrator";
