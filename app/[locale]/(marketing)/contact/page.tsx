import type { Metadata } from "next";
import ContactUs from "@/components/ui/ContactUs";
import { metadataForLocalizedRoute } from "@/config/metadata.config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return metadataForLocalizedRoute(locale, "/contact");
}

export default function Page() {  return <ContactUs/>;
}
