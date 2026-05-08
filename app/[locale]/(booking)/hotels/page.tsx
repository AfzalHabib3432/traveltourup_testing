import type { Metadata } from "next";
import Hotels from "@/views/Hotels";
import { metadataForLocalizedRoute } from "@/config/metadata.config";
import {
  getHotelsPageLayout,
  recordToUrlSearchParams,
} from "@/lib/hotels/hotels-page-layout";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return metadataForLocalizedRoute(locale, "/hotels");
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: PageProps) {
  const sp = await searchParams;
  const qs = recordToUrlSearchParams(sp);
  const layout = getHotelsPageLayout(qs);
  return <Hotels layout={layout} />;
}
