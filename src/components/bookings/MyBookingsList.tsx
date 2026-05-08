"use client";

import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Loader2 } from "lucide-react";
import {
  bookingSummaryDateIso,
  bookingSummarySubtitle,
  bookingSummaryTitle,
  bookingTypeLabel,
} from "@/lib/bookings/booking-summary";
import type { BookingListItemDto } from "@/lib/bookings/booking.types";
import { listMyBookings } from "@/lib/http/bookings.client";
import { Button } from "@/components/ui/Button";
import { NativeSelect } from "@/components/ui/NativeSelect";

const PAGE_SIZE = 10;

export function MyBookingsList({
  highlightRef,
  standalone = false,
}: {
  /** `booking_ref_no` or internal `id` to scroll + ring when returning from checkout. */
  highlightRef?: string | null;
  standalone?: boolean;
}) {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [items, setItems] = useState<BookingListItemDto[]>([]);
  const [meta, setMeta] = useState<{ total: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listMyBookings({
        page,
        limit: PAGE_SIZE,
        ...(typeFilter ? { type: typeFilter } : {}),
      });
      setItems(res.data);
      setMeta({ total: res.meta.total, totalPages: res.meta.totalPages });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load bookings");
      setItems([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!highlightRef || loading) return;
    const byId = document.getElementById(`booking-card-${highlightRef}`);
    if (byId) {
      byId.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const refEl = Array.from(document.querySelectorAll<HTMLElement>("[data-booking-ref]")).find(
      (node) => node.getAttribute("data-booking-ref") === highlightRef,
    );
    refEl?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightRef, loading, items]);

  return (
    <div className="space-y-6">
      {standalone ? (
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">My bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Flights, hotels, and car rentals in one place.
          </p>
        </div>
      ) : (
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">My orders</h2>
          <p className="mt-1 text-sm text-muted-foreground">View and open your trip confirmations.</p>
          <p className="mt-2 text-sm">
            <Link href="/profile/bookings" className="font-medium text-primary hover:underline">
              Open full-page list
            </Link>
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <NativeSelect
          id="bookings-type-filter"
          label="Booking type"
          wrapperClassName="sm:max-w-[220px]"
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All types</option>
          <option value="flight">Flights</option>
          <option value="hotel">Hotels</option>
          <option value="car">Cars</option>
        </NativeSelect>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
        </div>
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-border bg-muted/30 py-12 text-center text-muted-foreground">
          No bookings yet. When you complete a purchase, it will appear here.
        </p>
      ) : (
        <ul className="space-y-3" role="list">
          {items.map((b) => {
            const title = bookingSummaryTitle(b);
            const sub = bookingSummarySubtitle(b);
            const dateStr = bookingSummaryDateIso(b);
            const dateLabel =
              dateStr.length >= 10
                ? new Date(dateStr).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "—";
            const highlight =
              highlightRef && (b.booking_ref_no === highlightRef || b.id === highlightRef);
            return (
              <li key={b.id}>
                <Link
                  id={`booking-card-${b.id}`}
                  data-booking-ref={b.booking_ref_no}
                  href={`/profile/bookings/${encodeURIComponent(b.id)}`}
                  className={`block rounded-xl border p-4 transition hover:border-primary/40 hover:bg-muted/20 ${
                    highlight ? "border-primary ring-2 ring-primary/25" : "border-border bg-card"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        {bookingTypeLabel(b.type)}
                      </span>
                      <h3 className="mt-2 font-semibold text-foreground">{title}</h3>
                      {sub ? <p className="mt-0.5 text-sm text-muted-foreground">{sub}</p> : null}
                      {b.type === "flight" && b.flight_booking?.booking_reference ? (
                        <p className="mt-1 text-xs font-medium text-foreground">
                          Airline PNR {b.flight_booking.booking_reference}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-muted-foreground">
                        Booked {dateLabel} · Ref {b.booking_ref_no}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {b.currency} {b.total_amount}
                      </p>
                      <p className="text-xs capitalize text-muted-foreground">{b.status}</p>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {meta && meta.totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {meta.totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            disabled={page >= meta.totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
