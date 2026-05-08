import type { FlightOfferDTO } from "@/lib/duffel/dto/flight-offer.dto";
import type { FlightCardData } from "@/components/ui/Card";
import { flightOfferToListDisplay } from "@/lib/flights/list-display";

/** Map normalized offer → marketing card (reuses list-display for one-way “hero” slice). */
export function flightOfferToFeaturedCard(offer: FlightOfferDTO): FlightCardData {
  const row = flightOfferToListDisplay(offer);
  return {
    id: row.id,
    airline: row.airline,
    airlineLogo: row.airlineLogoUrl ?? undefined,
    departureCity: row.departureAirport,
    arrivalCity: row.arrivalAirport,
    departureTime: row.departureTime,
    arrivalTime: row.arrivalTime,
    duration: row.duration,
    stops: row.stopDetails,
    price: Number.isFinite(row.price) ? row.price : 0,
    currency: row.currency,
  };
}
