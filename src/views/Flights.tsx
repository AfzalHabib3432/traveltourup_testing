import React, { Suspense } from "react";
import type { FlightsPageLayout } from "@/lib/flights/flights-page-layout";
import { HubPageH1 } from "@/components/seo/hub-page-h1";
import FlightsTab from "@/components/flights/FlightsTab";
import FlightList from "@/components/flights/FlightList";
import FeaturedFlights from "@/components/flights/FeaturedFlights";
import { FlightListSearchSkeleton } from "@/components/flights/FlightListSkeleton";

type Props = { layout: FlightsPageLayout };

const featuredFallback = (
  <div className="py-10 bg-muted/40">
    <div className="container mx-auto px-4 min-h-[200px] animate-pulse rounded-xl bg-muted/60" />
  </div>
);

const flightListFallback = (
  <div className="min-h-screen bg-muted">
    <div className="border-b border-border/60 bg-muted shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-4">
        <div className="h-8 max-w-md animate-pulse rounded-md bg-muted-foreground/15" />
        <div className="mt-2 h-4 max-w-lg animate-pulse rounded bg-muted-foreground/10" />
      </div>
    </div>
    <div className="container mx-auto px-4 py-8">
      <FlightListSearchSkeleton rows={5} />
    </div>
  </div>
);

const flightsTabFallback = (
  <div className="bg-muted px-4 pt-10 md:px-10">
    <div className="rounded-xl border border-border/60 bg-background/80 p-6 min-h-[280px] animate-pulse" />
  </div>
);

const Flights = ({ layout }: Props): React.ReactElement => {
  const showResults = layout === "results";

  return (
    <div>
      <main>
        <HubPageH1 page="Flights" />
        {!showResults ? (
          <div id="flight-search" className="bg-muted pt-10 px-4 md:px-10 scroll-mt-16">
            <Suspense fallback={flightsTabFallback}>
              <FlightsTab />
            </Suspense>
          </div>
        ) : null}
        {showResults ? (
          <Suspense fallback={flightListFallback}>
            <FlightList />
          </Suspense>
        ) : null}
        <Suspense fallback={featuredFallback}>
          <FeaturedFlights bgColor="bg-muted/40" />
        </Suspense>
      </main>
    </div>
  );
};

export default Flights;
