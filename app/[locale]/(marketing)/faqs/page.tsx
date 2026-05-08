import type { Metadata } from "next";
import { getMessages } from "next-intl/server";
import { FaqPageJsonLd } from "@/components/seo/faq-page-json-ld";
import { metadataForLocalizedRoute } from "@/config/metadata.config";
import Faqs from "@/views/Faqs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return metadataForLocalizedRoute(locale, "/faqs");
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const messages = (await getMessages({ locale })) as {
    FAQ: { items: Array<{ question: string; answer: string }> };
  };

  return (
    <>
      <FaqPageJsonLd locale={locale} items={messages.FAQ.items} />
      <Faqs />
    </>
  );
}
