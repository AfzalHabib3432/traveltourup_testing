import { HotelCheckoutLoadingSkeleton } from "@/components/hotels/HotelCheckoutLoadingSkeleton";

/** Shown instantly on navigation to `/hotels/payment` while the server shell resolves. */
export default function HotelsPaymentLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-muted">
      <div className="flex-grow pt-12 pb-12 sm:px-4">
        <HotelCheckoutLoadingSkeleton />
      </div>
    </div>
  );
}
