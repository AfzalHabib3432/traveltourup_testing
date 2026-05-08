import { describe, expect, it } from "vitest";
import {
  DEFAULT_CHILD_SEARCH_AGE,
  passengersFromCounts,
  passengersToDuffelOfferRequest,
} from "./passengers";

describe("passengersToDuffelOfferRequest", () => {
  it("sends type-only for adults and lap infants (Duffel mutually exclusive type/age)", () => {
    const duffel = passengersToDuffelOfferRequest([
      { type: "adult" },
      { type: "adult" },
      { type: "infant_without_seat" },
    ]);
    expect(duffel).toEqual([
      { type: "adult" },
      { type: "adult" },
      { type: "infant_without_seat" },
    ]);
  });

  it("sends age-only for children (no type field)", () => {
    const duffel = passengersToDuffelOfferRequest([
      { type: "adult" },
      { type: "child", age: 10 },
    ]);
    expect(duffel).toEqual([{ type: "adult" }, { age: 10 }]);
  });

  it("defaults child age when missing", () => {
    const duffel = passengersToDuffelOfferRequest([{ type: "child" }]);
    expect(duffel).toEqual([{ age: DEFAULT_CHILD_SEARCH_AGE }]);
  });

  it("clamps child age into 2–17", () => {
    expect(passengersToDuffelOfferRequest([{ type: "child", age: 1 }])).toEqual([{ age: 2 }]);
    expect(passengersToDuffelOfferRequest([{ type: "child", age: 99 }])).toEqual([{ age: 17 }]);
  });
});

describe("passengersFromCounts", () => {
  it("does not attach age to lap infants", () => {
    const list = passengersFromCounts({ adults: 1, children: 0, infants: 1 });
    expect(list).toEqual([{ type: "adult" }, { type: "infant_without_seat" }]);
  });
});
