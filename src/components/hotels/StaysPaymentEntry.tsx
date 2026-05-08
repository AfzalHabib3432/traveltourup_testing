"use client";

import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { HotelCheckoutDuffel } from "@/components/hotels/HotelCheckoutDuffel";

/**
 * Hotel checkout for Duffel Stays: requires `?quote_id=quo_…` (and optional session `ttu_stays_quote`).
 * Checkout is bundled with this entry (no lazy chunk) so the skeleton from `loading.tsx` / Suspense
 * matches immediately and the form is not delayed by a second network fetch.
 */
export function StaysPaymentEntry() {
  const searchParams = useSearchParams();
  const quoteId = searchParams.get("quote_id")?.trim() ?? "";

  if (!quoteId) {
    return (
      <div className="min-h-screen bg-muted flex flex-col">
        <div className="flex-grow pt-24 pb-12 container mx-auto px-4 max-w-lg text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Hotel checkout</h1>
          <p className="text-muted-foreground mb-6">
            Select a room and get a quote first, then proceed to payment. A quote id is required in the URL.
          </p>
          <Link
            href="/hotels"
            className="inline-flex rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground"
          >
            Search hotels
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <div className="flex-grow pt-12 pb-12 sm:px-4">
        <HotelCheckoutDuffel quoteId={quoteId} />
      </div>
    </div>
  );
}
