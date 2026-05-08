import type { Metadata } from "next";
import {
  createLocalizedRouteMetadata,
  getLocalizedRouteMetadata,
} from "@/config/metadata.config";
import { MOCK_HOTELS } from "@/data/mock-hotels";
import HotelDetailPageClient from "./HotelDetailPageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const raw = id.trim();
  const decoded = decodeURIComponent(raw);
  const path = decoded ? `/hotels/${encodeURIComponent(raw)}` : "/hotels";
  const base = await getLocalizedRouteMetadata(locale, "/hotels");

  const isDuffelStays = /^[a-z]{2,}_[A-Za-z0-9_-]+$/.test(decoded);
  const mockHotel = !isDuffelStays ? MOCK_HOTELS.find((h) => String(h.id) === decoded) : undefined;
  const descSnippet = mockHotel?.description?.trim() ?? "";

  const config = {
    ...base,
    title: mockHotel ? `${mockHotel.name} — Hotel` : "Hotel offer details",
    description: mockHotel
      ? (descSnippet
          ? `${descSnippet.slice(0, 155)}${descSnippet.length > 155 ? "…" : ""}`
          : "View hotel details and book on TravelTourUp.")
      : "Review this hotel rate and continue to booking on TravelTourUp.",
    openGraph: {
      title: mockHotel ? `${mockHotel.name} — TravelTourUp` : "Hotel offer details",
      description: mockHotel
        ? (descSnippet
            ? `${descSnippet.slice(0, 200)}${descSnippet.length > 200 ? "…" : ""}`
            : base.description)
        : base.description,
    },
  };

  return createLocalizedRouteMetadata(config, locale, path, {
    ...(isDuffelStays ? { robots: { index: false, follow: true } } : {}),
  });
}

export default function HotelDetailPage() {
  return <HotelDetailPageClient />;
}
