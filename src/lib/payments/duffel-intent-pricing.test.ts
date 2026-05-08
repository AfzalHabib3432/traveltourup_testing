import { describe, expect, it } from "vitest";
import { computeDuffelPaymentIntentBreakdown } from "./duffel-intent-pricing";
import type { FlightPaymentsResolvedConfig } from "@/config/flight-payments.config";

describe("computeDuffelPaymentIntentBreakdown", () => {
  it("matches Duffel guide numeric example (EUR fare + 1€ markup, GBP via FX, 2.9% fee)", () => {
    const cfg: FlightPaymentsResolvedConfig = {
      commissionPercent: 0,
      markupFixed: "1",
      duffelPaymentsFeeRate: 0.029,
      fxRateToCustomerCurrency: 0.85,
      priceToleranceMajor: 2,
    };
    const b = computeDuffelPaymentIntentBreakdown("120.00", "EUR", cfg);
    expect(b.offer_total).toBe("120.00");
    expect(b.services_subtotal).toBe("0.00");
    expect(b.markup_amount).toBe("1.00");
    expect(b.subtotal_charged).toBe("102.85");
    expect(b.charge_amount).toBe("105.92");
  });

  it("includes services subtotal in commission base", () => {
    const cfg: FlightPaymentsResolvedConfig = {
      commissionPercent: 10,
      markupFixed: "0",
      duffelPaymentsFeeRate: 0.029,
      fxRateToCustomerCurrency: 1,
      priceToleranceMajor: 2,
    };
    const b = computeDuffelPaymentIntentBreakdown("100.00", "USD", cfg, {
      servicesSubtotal: "50.00",
    });
    expect(b.offer_total).toBe("100.00");
    expect(b.services_subtotal).toBe("50.00");
    expect(b.markup_amount).toBe("15.00");
  });

  it("applies commission percent on fare plus fixed markup", () => {
    const cfg: FlightPaymentsResolvedConfig = {
      commissionPercent: 10,
      markupFixed: "2.00",
      duffelPaymentsFeeRate: 0.029,
      fxRateToCustomerCurrency: 1,
      priceToleranceMajor: 2,
    };
    const b = computeDuffelPaymentIntentBreakdown("100.00", "USD", cfg);
    expect(b.services_subtotal).toBe("0.00");
    expect(b.markup_amount).toBe("12.00");
    expect(b.subtotal_charged).toBe("112.00");
    expect(Number.parseFloat(b.charge_amount)).toBeCloseTo(112 / (1 - 0.029), 2);
  });
});
