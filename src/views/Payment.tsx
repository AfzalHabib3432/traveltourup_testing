"use client";
import React, { Suspense, useEffect } from "react";
import { FlightPaymentEntry } from "@/components/flights/FlightPaymentEntry";

const suspenseFallback = (
  <div className="min-h-screen bg-muted flex flex-col">
    <div className="flex-grow pt-24 pb-12">
      <div className="container mx-auto max-w-3xl min-h-[200px] animate-pulse rounded-xl bg-muted/60" />
    </div>
  </div>
);

/**
 * Booking-flow payment shell. Flights use Duffel Payments (`?offer_id=`).
 */
const Payment = (): React.ReactElement => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Suspense fallback={suspenseFallback}>
      <FlightPaymentEntry />
    </Suspense>
  );
};

export default Payment;
