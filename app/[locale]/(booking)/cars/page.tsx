import type { Metadata } from "next";
import Cars from "@/views/Cars";
import { metadataForLocalizedRoute } from "@/config/metadata.config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return metadataForLocalizedRoute(locale, "/cars");
}

export default function Page() {
  return <Cars />;
}
