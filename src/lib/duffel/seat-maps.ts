import "server-only";
import { duffelFetch } from "./client";

/** `GET /air/seat_maps?offer_id=` — one seat map per segment when supported. */
export function listSeatMapsForOffer(offerId: string) {
  const qs = new URLSearchParams({ offer_id: offerId }).toString();
  return duffelFetch<unknown>(`/air/seat_maps?${qs}`);
}
