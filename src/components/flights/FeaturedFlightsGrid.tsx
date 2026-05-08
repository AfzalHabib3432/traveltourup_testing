import { Link } from "@/i18n/navigation";
import { Card, type FlightCardData } from "@/components/ui/Card";

function FlightCardSkeletonTile() {
  return (
    <div
      className="rounded-xl border border-border/60 bg-card p-5 shadow-sm"
      aria-hidden
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-muted animate-pulse" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-24 rounded-md bg-muted animate-pulse" />
            <div className="h-3 w-16 rounded-md bg-muted/80 animate-pulse" />
          </div>
        </div>
        <div className="shrink-0 space-y-2 text-right">
          <div className="ml-auto h-7 w-16 rounded-md bg-muted animate-pulse" />
          <div className="ml-auto h-3 w-14 rounded-md bg-muted/80 animate-pulse" />
        </div>
      </div>
      <div className="mb-5 flex items-center justify-between gap-2">
        <div className="space-y-2">
          <div className="h-5 w-14 rounded-md bg-muted animate-pulse" />
          <div className="h-3 w-20 rounded-md bg-muted/80 animate-pulse" />
        </div>
        <div className="flex flex-col items-center px-2">
          <div className="mb-1 h-3 w-10 rounded bg-muted/80 animate-pulse" />
          <div className="h-px w-16 bg-border" />
          <div className="mt-1 h-3 w-12 rounded bg-muted/80 animate-pulse" />
        </div>
        <div className="space-y-2 text-right">
          <div className="ml-auto h-5 w-14 rounded-md bg-muted animate-pulse" />
          <div className="ml-auto h-3 w-14 rounded-md bg-muted/80 animate-pulse" />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
        <div className="h-4 w-28 rounded bg-muted/80 animate-pulse" />
        <div className="h-9 w-24 rounded-lg bg-muted animate-pulse" />
      </div>
    </div>
  );
}

/**
 * Placeholder for the featured deals grid while offers load. Matches the 2×3 card layout and card chrome.
 */
export function FeaturedFlightsGridSkeleton() {
  return (
    <div
      className="grid min-h-[280px] grid-cols-1 gap-4 md:grid-cols-2"
      role="status"
      aria-live="polite"
      aria-label="Loading featured flight deals"
    >
      {Array.from({ length: 6 }, (_, i) => (
        <FlightCardSkeletonTile key={i} />
      ))}
    </div>
  );
}

type FeaturedFlightsGridProps = {
  cards: FlightCardData[];
};

/**
 * Featured flight offer tiles or empty state (Duffel unavailable / no results).
 */
export function FeaturedFlightsGrid({ cards }: FeaturedFlightsGridProps) {
  if (cards.length === 0) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-muted-foreground">
        <div>
          <p className="font-medium text-foreground mb-2">Live deals unavailable</p>
          <p className="text-sm mb-4">
            Configure Duffel and try again, or search manually to see current offers.
          </p>
          <Link
            href="/flights#flight-search"
            className="text-primary font-semibold hover:underline"
          >
            Open flight search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {cards.slice(0, 6).map((flight, index) => (
        <Card
          key={String(
            flight.id ?? `${flight.departureCity ?? "?"}-${flight.arrivalCity ?? "?"}-${index}`,
          )}
          variant="flight"
          data={flight}
          actionHref={
            flight.id != null ? `/flights/${encodeURIComponent(String(flight.id))}` : "/flights"
          }
        />
      ))}
    </div>
  );
}
