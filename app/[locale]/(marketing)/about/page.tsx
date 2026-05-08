import type { Metadata } from "next";
import AboutUs from "@/views/AboutUs";
import { metadataForLocalizedRoute } from "@/config/metadata.config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return metadataForLocalizedRoute(locale, "/about");
}

export default function Page() {
  return <AboutUs />;
}
