"use client";

import { notFound, useParams } from "next/navigation";
import { useMemo } from "react";
import { MOCK_HOTELS } from "@/data/mock-hotels";
import HotelDetail from "@/views/HotelDetail";
import StaysHotelDetail from "@/views/StaysHotelDetail";

function isDuffelStaysSearchResultRouteId(id: string) {
  return /^[a-z]{2,}_[A-Za-z0-9_-]+$/.test(id);
}

export default function HotelDetailPageClient() {
  const params = useParams();
  const rawId = typeof params?.id === "string" ? params.id : "";
  const decoded = decodeURIComponent(rawId.trim());

  const duffelId = useMemo(() => (isDuffelStaysSearchResultRouteId(decoded) ? decoded : null), [decoded]);

  if (!decoded) {
    notFound();
  }

  if (duffelId) {
    return <StaysHotelDetail searchResultId={duffelId} />;
  }

  const hotel = MOCK_HOTELS.find((h) => String(h.id) === decoded);
  if (!hotel) {
    notFound();
  }

  return <HotelDetail hotel={hotel} />;
}
