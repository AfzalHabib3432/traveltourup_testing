/** Session keys for passing Duffel ancillaries from flight detail → checkout. */

export function flightAncillariesStorageKey(offerId: string): string {
  return `ttu_flight_ancillaries_${offerId}`;
}

export type StoredFlightAncillaries = {
  bagQuantities: Record<string, number>;
  seatSelections: Record<string, string>;
  seatPassengerId?: string;
};
