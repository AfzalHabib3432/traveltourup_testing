import { z } from "zod";

const schema = z.object({
  FLIGHT_COMMISSION_PERCENT: z.coerce.number().min(0).max(100).optional(),
  FLIGHT_MARKUP_FIXED: z.string().optional(),
  DUFFEL_PAYMENTS_FEE_RATE: z.coerce.number().gt(0).lt(1).optional(),
  FLIGHT_PAYMENT_FX_RATE: z.coerce.number().gt(0).optional(),
  /** Max allowed drift between intent snapshot offer total and refreshed offer (major units). */
  FLIGHT_PRICE_TOLERANCE_MAJOR: z.coerce.number().min(0).optional(),
});

function raw() {
  const fixed = process.env.FLIGHT_MARKUP_FIXED?.trim();
  return {
    FLIGHT_COMMISSION_PERCENT: process.env.FLIGHT_COMMISSION_PERCENT,
    FLIGHT_MARKUP_FIXED: fixed && fixed.length > 0 ? fixed : undefined,
    DUFFEL_PAYMENTS_FEE_RATE: process.env.DUFFEL_PAYMENTS_FEE_RATE,
    FLIGHT_PAYMENT_FX_RATE: process.env.FLIGHT_PAYMENT_FX_RATE,
    FLIGHT_PRICE_TOLERANCE_MAJOR: process.env.FLIGHT_PRICE_TOLERANCE_MAJOR,
  };
}

export type FlightPaymentsResolvedConfig = {
  /** Percent of Duffel offer total added as commission (0–100). */
  commissionPercent: number;
  /** Fixed major-unit amount added in offer currency (e.g. "5.00"). */
  markupFixed: string;
  /** Assumed Duffel Payments fee rate for gross-up (e.g. 0.029). Domestic vs international may differ. */
  duffelPaymentsFeeRate: number;
  /** Multiplier from balance/offer currency to customer charge currency; 1 when same. */
  fxRateToCustomerCurrency: number;
  /** Major-unit tolerance when comparing PaymentIntent offer snapshot vs refreshed offer before order. */
  priceToleranceMajor: number;
};

const DEFAULT_FEE = 0.029;

/**
 * Flight checkout pricing knobs for Duffel PaymentIntent gross-up.
 * Safe to call from server code; fails closed on invalid env numbers.
 */
export function getFlightPaymentsConfig(): FlightPaymentsResolvedConfig {
  const parsed = schema.parse(raw());
  return {
    commissionPercent: parsed.FLIGHT_COMMISSION_PERCENT ?? 0,
    markupFixed: parsed.FLIGHT_MARKUP_FIXED ?? "0",
    duffelPaymentsFeeRate: parsed.DUFFEL_PAYMENTS_FEE_RATE ?? DEFAULT_FEE,
    fxRateToCustomerCurrency: parsed.FLIGHT_PAYMENT_FX_RATE ?? 1,
    priceToleranceMajor: parsed.FLIGHT_PRICE_TOLERANCE_MAJOR ?? 2,
  };
}
