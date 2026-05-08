import { describe, expect, it } from "vitest";
import { mergeFlightOrderServiceLines } from "./flight-ancillaries.schema";

describe("mergeFlightOrderServiceLines", () => {
  it("merges duplicate ids by summing quantity", () => {
    expect(
      mergeFlightOrderServiceLines([
        { id: "ase_1", quantity: 1 },
        { id: "ase_1", quantity: 2 },
      ]),
    ).toEqual([{ id: "ase_1", quantity: 3 }]);
  });
});
