import { describe, expect, it } from "vitest";
import { cabinClassToDuffel, flightSearchBodySchema, normalizeDuffelCode } from "./flights.schema";

describe("flights.schema", () => {
  it("normalizes IATA codes", () => {
    expect(normalizeDuffelCode(" lhr ")).toBe("LHR");
  });

  it("maps UI cabin to Duffel", () => {
    expect(cabinClassToDuffel("premium-economy")).toBe("premium_economy");
    expect(cabinClassToDuffel("first-class")).toBe("first");
  });

  it("accepts minimal valid search body", () => {
    const parsed = flightSearchBodySchema.safeParse({
      slices: [{ origin: "LHR", destination: "JFK", departure_date: "2026-08-01" }],
      passengers: [{ type: "adult" }],
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.cabin_class).toBe("economy");
      expect(parsed.data.limit).toBe(30);
    }
  });

  it("rejects empty slices", () => {
    const parsed = flightSearchBodySchema.safeParse({
      slices: [],
      passengers: [{ type: "adult" }],
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects age on non-child passengers (Duffel offers only one of type or age)", () => {
    const parsed = flightSearchBodySchema.safeParse({
      slices: [{ origin: "LHR", destination: "JFK", departure_date: "2026-08-01" }],
      passengers: [{ type: "adult", age: 30 }],
    });
    expect(parsed.success).toBe(false);
  });
});
