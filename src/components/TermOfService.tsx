import { getLocale, getMessages } from "next-intl/server";

import type { TermsPageMessages } from "@/data/terms";
import { rtlDirProp, rtlTypographyClass } from "@/lib/i18n/rtl-typography";

export default async function TermsOfService() {
  const locale = await getLocale();
  const messages = await getMessages();
  const page = messages.TermsPage as TermsPageMessages;

  const dir = rtlDirProp(locale);
  const typo = rtlTypographyClass(locale);

  return (
    <div className="bg-muted">
      <div className="container m-auto px-2 lg:px-10 lg:py-16 py-8">
        <div className="mb-4 grid grid-cols-1 gap-2 lg:gap-4 md:grid-cols-3">
          {page.topCards.map((item, i) => (
            <div
              key={`terms-card-${i}`}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div dir={dir} className={typo}>
                <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground md:text-lg md:font-semibold">
                  {item.title}
                </p>
                <p className="mt-2 text-sm text-foreground md:text-base">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <section className="space-y-2 lg:space-y-4">
          {page.sections.map((section, i) => (
            <div
              key={`terms-section-${i}`}
              className="rounded-2xl border border-border/70 bg-background/70 p-5 md:p-6"
            >
              <div dir={dir} className={typo}>
                <h2 className="text-lg font-medium text-foreground md:text-2xl md:font-semibold">
                  {section.title}
                </h2>

                {section.content && (
                  <p className="mt-3 text-sm leading-6 text-foreground md:text-base md:leading-7">
                    {section.content}
                  </p>
                )}

                {section.points && (
                  <ul className="mt-4 space-y-2 ps-2">
                    {section.points.map((point, j) => (
                      <li
                        key={`terms-point-${i}-${j}`}
                        className="flex items-start gap-2 text-sm leading-6 md:text-base md:leading-7"
                      >
                        <span className="text-primary shrink-0" aria-hidden>
                          ✓
                        </span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
