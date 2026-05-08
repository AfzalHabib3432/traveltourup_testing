import { JsonLd } from "@/components/seo/json-ld";
import { getSiteUrl } from "@/config/site-url";

export type FaqLdItem = { question: string; answer: string };

type FaqPageJsonLdProps = {
  locale: string;
  items: FaqLdItem[];
};

/** FAQPage — must match visible Q&A on the page (same locale). */
export function FaqPageJsonLd({ locale, items }: FaqPageJsonLdProps) {
  const base = getSiteUrl();
  const pageUrl = `${base}/${locale}/faqs`;

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    url: pageUrl,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return <JsonLd data={faqPage} />;
}
