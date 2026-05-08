import "server-only";

import { listSeatMapsForOffer } from "@/lib/duffel/seat-maps";
import { mapDuffelSeatMapsResponse, type SeatMapDTO } from "@/lib/duffel/dto/seat-map.dto";

export async function getSeatMapsForOffer(offerId: string): Promise<SeatMapDTO[]> {
  const raw = await listSeatMapsForOffer(offerId);
  return mapDuffelSeatMapsResponse(raw);
}
