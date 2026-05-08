import type { FlightOfferDTO } from "@/lib/duffel/dto/flight-offer.dto";
import type { SeatMapDTO } from "@/lib/duffel/dto/seat-map.dto";

function findSeatServiceAmount(seatMaps: SeatMapDTO[] | null, serviceId: string): number {
  if (!seatMaps?.length) return 0;
  for (const sm of seatMaps) {
    for (const cab of sm.cabins) {
      for (const row of cab.rows) {
        for (const sec of row.sections) {
          for (const el of sec.elements) {
            for (const svc of el.services) {
              if (svc.id === serviceId) {
                const n = parseFloat(svc.total_amount);
                return Number.isFinite(n) ? n : 0;
              }
            }
          }
        }
      }
    }
  }
  return 0;
}

/** Estimated add-on total (bags + seats) in `currency`; base fare is separate on the offer. */
export function estimateAncillariesAddOn(
  offer: FlightOfferDTO,
  bagQuantities: Record<string, number>,
  seatSelections: Record<string, string>,
  seatMaps: SeatMapDTO[] | null,
): { addOn: number; currency: string } {
  const currency = offer.total_currency;
  let addOn = 0;
  for (const s of offer.available_services) {
    const q = bagQuantities[s.id] ?? 0;
    const unit = parseFloat(s.total_amount);
    if (!Number.isFinite(unit) || q <= 0) continue;
    addOn += q * unit;
  }
  const seen = new Set<string>();
  for (const svcId of Object.values(seatSelections)) {
    if (!svcId || seen.has(svcId)) continue;
    seen.add(svcId);
    addOn += findSeatServiceAmount(seatMaps, svcId);
  }
  return { addOn, currency };
}
