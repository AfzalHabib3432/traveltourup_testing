"use client";

import React, { Suspense, useEffect } from "react";
import { StaysPaymentEntry } from "@/components/hotels/StaysPaymentEntry";
import { HotelCheckoutLoadingSkeleton } from "@/components/hotels/HotelCheckoutLoadingSkeleton";

const fallback = (
  <div className="flex min-h-screen flex-col bg-muted">
    <div className="flex-grow pt-12 pb-12 sm:px-4">
      <HotelCheckoutLoadingSkeleton />
    </div>
  </div>
);

export function HotelPaymentPageClient() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Suspense fallback={fallback}>
      <StaysPaymentEntry />
    </Suspense>
  );
}
