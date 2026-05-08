import type { Metadata } from "next";
import PrivacyPolicy from "@/views/PrivacyPolicy";
import { metadataForLocalizedRoute } from "@/config/metadata.config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return metadataForLocalizedRoute(locale, "/privacy");
}

export default function Page() {
  return <PrivacyPolicy />;
}
