import type { Metadata } from "next";
import TermOfServicePage from "@/views/TermOfServicePage";
import { metadataForLocalizedRoute } from "@/config/metadata.config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return metadataForLocalizedRoute(locale, "/terms");
}

export default function Page() {
  return <TermOfServicePage />;
}
