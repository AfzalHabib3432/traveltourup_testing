import { describe, expect, it } from "vitest";
import { flightBookingCancelBodySchema } from "./flight-cancel.schema";

describe("flightBookingCancelBodySchema", () => {
  it("accepts quote action", () => {
    const p = flightBookingCancelBodySchema.safeParse({ action: "quote" });
    expect(p.success).toBe(true);
  });

  it("accepts confirm with ore id", () => {
    const p = flightBookingCancelBodySchema.safeParse({
      action: "confirm",
      order_cancellation_id: "ore_00009qzZWzjDipIkqpaUAj",
    });
    expect(p.success).toBe(true);
  });

  it("rejects invalid ore prefix", () => {
    const p = flightBookingCancelBodySchema.safeParse({
      action: "confirm",
      order_cancellation_id: "ord_xxx",
    });
    expect(p.success).toBe(false);
  });
});
