"use client";

import { useState } from "react";
import { useLocale, useMessages, useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { isRtlLocale } from "@/lib/i18n/rtl";
import { rtlDirProp, rtlTypographyClass } from "@/lib/i18n/rtl-typography";

import SectionHeading from "./shared/SectionHeading";

interface FaqSProps {
  limit?: number;
  secHead?: boolean;
}

export default function FaqS({ limit, secHead = true }: FaqSProps) {
  const locale = useLocale();
  const rtl = isRtlLocale(locale);
  const [active, setActive] = useState<number | null>(0);
  const messages = useMessages() as {
    FAQ: { items: Array<{ question: string; answer: string }> };
  };
  const t = useTranslations("FAQ");

  const toggle = (index: number) => {
    setActive(active === index ? null : index);
  };

  const displayedFaqs = limit ? messages.FAQ.items.slice(0, limit) : messages.FAQ.items;

  const iconGlyph = (expanded: boolean) => (
    <span className="shrink-0 text-2xl text-primary" aria-hidden>
      {expanded ? "−" : "+"}
    </span>
  );

  return (
    <div className="py-8 md:py-16">
      <div className="max-w-6xl mx-auto px-6">
        {secHead && (
          <SectionHeading title={t("title")} subtitle={t("subtitle")} align="center" />
        )}
        <div className="space-y-6">
          {displayedFaqs.map((faq, index) => (
            <div key={index} className="border-b border-border pb-6">
              <button
                type="button"
                onClick={() => toggle(index)}
                className="flex w-full items-center justify-between gap-3"
              >
                {rtl ? (
                  <>
                    {iconGlyph(active === index)}
                    <span
                      dir={rtlDirProp(locale)}
                      className={cn(
                        "min-w-0 flex-1 text-lg font-medium",
                        rtlTypographyClass(locale),
                        active === index ? "text-primary" : "text-foreground",
                      )}
                    >
                      {faq.question}
                    </span>
                  </>
                ) : (
                  <>
                    <span
                      className={cn(
                        "min-w-0 flex-1 text-left text-lg font-medium",
                        active === index ? "text-primary" : "text-foreground",
                      )}
                    >
                      {faq.question}
                    </span>
                    {iconGlyph(active === index)}
                  </>
                )}
              </button>

              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  active === index ? "max-h-40 mt-2 opacity-100" : "max-h-0 opacity-0",
                )}
              >
                <p
                  dir={rtlDirProp(locale)}
                  className={cn(
                    "leading-relaxed text-muted-foreground",
                    rtl ? rtlTypographyClass(locale) : "text-left",
                  )}
                >
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
