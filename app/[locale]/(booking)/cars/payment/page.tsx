import type { Metadata } from "next";
import Payment from "@/views/Payment";
import { metadataForLocalizedRoute } from "@/config/metadata.config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return metadataForLocalizedRoute(locale, "/cars/payment", {
    robots: { index: false, follow: true },
  });
}

export default function Page() {
  return <Payment />;
}
