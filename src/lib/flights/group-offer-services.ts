import type { FlightOfferServiceDTO } from "@/lib/duffel/dto/flight-offer.dto";

/**
 * Duffel often returns multiple `available_services` rows with the same type/price/max
 * (e.g. one per slice). Group them for a single quantity control that applies to all member IDs.
 */
export function groupDuplicatedOfferServices(
  services: FlightOfferServiceDTO[],
): { display: FlightOfferServiceDTO; memberIds: string[] }[] {
  const map = new Map<string, FlightOfferServiceDTO[]>();
  for (const s of services) {
    const key = `${s.type ?? ""}|${s.total_amount}|${s.total_currency}|${String(s.maximum_quantity ?? "")}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  return Array.from(map.values()).map((members) => ({
    display: members[0],
    memberIds: members.map((m) => m.id),
  }));
}
