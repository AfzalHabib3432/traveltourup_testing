export type PassengerCounts = { adults: number; children: number; infants: number };

/** Default age used when the UI sends “child” without a specific age (search-only). */
export const DEFAULT_CHILD_SEARCH_AGE = 8;

/**
 * Passengers as stored in our search API / URL-derived body (`FlightSearchBody`).
 * Ages on minors are for our own defaults; see `passengersToDuffelOfferRequest` for Duffel payload rules.
 */
export type FlightSearchPassenger =
  | { type: "adult" }
  | { type: "child"; age: number }
  | { type: "infant_without_seat" };

/**
 * Build passenger list from booking-style counts.
 * Infants use `type` only (no `age`); children include a placeholder age for Duffel’s age-based search.
 */
export function passengersFromCounts(counts: PassengerCounts): FlightSearchPassenger[] {
  const list: FlightSearchPassenger[] = [];
  for (let i = 0; i < counts.adults; i++) list.push({ type: "adult" });
  for (let i = 0; i < counts.children; i++) list.push({ type: "child", age: DEFAULT_CHILD_SEARCH_AGE });
  for (let i = 0; i < counts.infants; i++) list.push({ type: "infant_without_seat" });
  return list;
}

/** Explicit child ages aligned with `children` count (pads / ignores extras with defaults). */
export function passengersFromCountsAndChildAges(
  counts: PassengerCounts,
  childAges: number[],
): FlightSearchPassenger[] {
  const list: FlightSearchPassenger[] = [];
  for (let i = 0; i < counts.adults; i++) list.push({ type: "adult" });
  for (let i = 0; i < counts.children; i++) {
    const raw = childAges[i];
    const age =
      typeof raw === "number" && Number.isFinite(raw)
        ? Math.min(17, Math.max(0, Math.round(raw)))
        : DEFAULT_CHILD_SEARCH_AGE;
    list.push({ type: "child", age });
  }
  for (let i = 0; i < counts.infants; i++) list.push({ type: "infant_without_seat" });
  return list;
}

/**
 * Duffel offer request passengers: **either** `type` **or** `age`, never both on the same object.
 * @see https://duffel.com/docs/api/v2/offer-requests/create-offer-request
 */
export type DuffelOfferRequestPassenger =
  | { type: "adult" }
  | { type: "infant_without_seat" }
  | { age: number };

export function passengersToDuffelOfferRequest(
  passengers: Array<{ type: string; age?: number }>,
): DuffelOfferRequestPassenger[] {
  return passengers.map((p) => {
    switch (p.type) {
      case "adult":
        return { type: "adult" as const };
      case "child": {
        const raw =
          typeof p.age === "number" && Number.isFinite(p.age) ? p.age : DEFAULT_CHILD_SEARCH_AGE;
        const age = Math.min(17, Math.max(2, Math.round(raw)));
        return { age };
      }
      case "infant_without_seat":
        return { type: "infant_without_seat" as const };
      default:
        return { type: "adult" as const };
    }
  });
}
