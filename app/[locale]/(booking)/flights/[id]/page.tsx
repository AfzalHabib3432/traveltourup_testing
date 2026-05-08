import type { Metadata } from "next";
import {
  createLocalizedRouteMetadata,
  getLocalizedRouteMetadata,
} from "@/config/metadata.config";
import FlightDetailPageClient from "./FlightDetailPageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const safeId = id.trim();
  const path = safeId ? `/flights/${encodeURIComponent(safeId)}` : "/flights";
  const base = await getLocalizedRouteMetadata(locale, "/flights");
  const config = {
    ...base,
    title: "Flight offer details",
    description: "Review this flight offer and continue to booking on TravelTourUp.",
    openGraph: {
      title: "Flight offer details",
      description: base.description,
    },
  };
  return createLocalizedRouteMetadata(config, locale, path, {
    robots: { index: false, follow: true },
  });
}

export default function FlightDetailPage() {
  return <FlightDetailPageClient />;
}
