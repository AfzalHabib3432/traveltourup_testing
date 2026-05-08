"use client";

import React, { useEffect } from "react";
import { DetailPageLayout } from "@/components/shared/DetailPageLayout";
import { BookingSidebar } from "@/components/shared/BookingSidebar";
import { FlightDetailContent } from "@/components/flights/FlightDetailContent";
import { FlightOfferExpiryCountdown } from "@/components/flights/FlightOfferExpiryCountdown";
import { WishlistToggle } from "@/components/wishlist/WishlistToggle";
import { useBookingBreadcrumbFlightLabels } from "@/components/shared/BookingBreadcrumbFlightContext";
import { buildFlightDetailBreadcrumbLabels } from "@/lib/flights/flight-detail-breadcrumb";
import type { FlightListDisplay } from "@/lib/flights/list-display";
import type { FlightOfferDTO } from "@/lib/duffel/dto/flight-offer.dto";

export interface FlightDetailProps {
  flight: FlightListDisplay;
  offer: FlightOfferDTO;
}

/**
 * Flight detail page view.
 * Uses DetailPageLayout with FlightDetailContent and BookingSidebar.
 */
export default function FlightDetail({ flight, offer }: FlightDetailProps) {
  const { setFlightDetailLabels, resetFlightDetailLabels } = useBookingBreadcrumbFlightLabels();

  useEffect(() => {
    const { route, title } = buildFlightDetailBreadcrumbLabels(flight);
    setFlightDetailLabels({ route, title });
    return () => resetFlightDetailLabels();
  }, [flight, setFlightDetailLabels, resetFlightDetailLabels]);

  const bookingItem = {
    id: flight.id,
    price: flight.price,
    currency: flight.currency,
    airline: flight.airline,
    flightNumber: flight.flightNumber,
    departureAirport: flight.departureAirport,
    arrivalAirport: flight.arrivalAirport,
    departureTime: flight.departureTime,
    arrivalTime: flight.arrivalTime,
  };

  return (
    <DetailPageLayout
      mainContent={
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
            <WishlistToggle
              type="flight"
              refId={flight.id}
              title={`${flight.departureAirport} → ${flight.arrivalAirport}`}
              subtitle={`${flight.airline} ${flight.flightNumber} · ${flight.departureDate}`}
              imageUrl={flight.airlineLogoUrl}
            />
          </div>
          {flight.expires_at ? (
            <FlightOfferExpiryCountdown expires_at={flight.expires_at} />
          ) : null}
          <FlightDetailContent flight={flight} offer={offer} />
        </div>
      }
      sidebarContent={<BookingSidebar item={bookingItem} type="flight" flightOffer={offer} />}
    />
  );
}
