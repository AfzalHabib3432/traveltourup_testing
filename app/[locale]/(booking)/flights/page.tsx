import type { Metadata } from "next";
import Flights from "@/views/Flights";
import { metadataForLocalizedRoute } from "@/config/metadata.config";
import {
  getFlightsPageLayout,
  recordToUrlSearchParams,
} from "@/lib/flights/flights-page-layout";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return metadataForLocalizedRoute(locale, "/flights");
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: PageProps) {
  const sp = await searchParams;
  const qs = recordToUrlSearchParams(sp);
  const layout = getFlightsPageLayout(qs);
  return <Flights layout={layout} />;
}
