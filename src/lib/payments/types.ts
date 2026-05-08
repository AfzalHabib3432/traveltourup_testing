/**
 * Generic flight-checkout payment identifiers. Extend when adding PayPal / direct Stripe.
 */
export type FlightPaymentProviderId = "duffel_payments";

export type FlightCheckoutPricingBreakdown = {
  offer_total: string;
  offer_currency: string;
  /** Validated Duffel-side extras total in offer currency (0.00 when none). */
  services_subtotal: string;
  commission_and_fees_markup: string;
  customer_charge_amount: string;
  customer_charge_currency: string;
};

/** Result of preparing checkout (e.g. Duffel PaymentIntent created). */
export type PreparedFlightCheckout = {
  provider: FlightPaymentProviderId;
  payment_intent_id: string;
  client_token: string;
  status: string;
  offer_id: string;
  pricing: FlightCheckoutPricingBreakdown;
  idempotent_replay?: boolean;
  pricing_detail?: {
    subtotal_before_payment_fee: string;
    duffel_payments_fee_rate: number;
    fx_rate_applied: number;
  };
};
