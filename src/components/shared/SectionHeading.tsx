"use client";

import { useLocale } from "next-intl";

import AnimatedUnderline from "../ui/AnimatedUnderline";
import { cn } from "@/lib/utils";
import { isRtlLocale } from "@/lib/i18n/rtl";
import { rtlDirProp, rtlTypographyClass } from "@/lib/i18n/rtl-typography";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  subtitle2?: string;
  align?: "left" | "center";
}

export default function SectionHeading({
  title,
  subtitle,
  subtitle2,
  align = "left",
}: SectionHeadingProps) {
  const locale = useLocale();
  const rtl = isRtlLocale(locale);
  const isCenter = align === "center";

  return (
    <div className={cn(" md:mb-6", isCenter && !rtl && "text-center")}>
      <div
        className={cn(
          "mt-2 flex items-center gap-1",
          rtl ? "w-full justify-end" : isCenter && "justify-center",
        )}
      >
        <AnimatedUnderline
          title={title}
          isCenter={isCenter}
          subtitle2={subtitle2}
          rtl={rtl}
        />
      </div>

      {subtitle && (
        <div
          className={cn(
            rtl && "flex w-full justify-end",
          )}
        >
          <p
            dir={rtlDirProp(locale)}
            className={
              rtl
                ? rtlTypographyClass(
                    locale,
                    cn(
                      "text-muted-foreground text-base sm:text-lg leading-relaxed",
                      !isCenter && "max-w-2xl",
                    ),
                  )
                : isCenter
                  ? "text-muted-foreground text-base sm:text-lg leading-relaxed"
                  : "text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl"
            }
          >
            {subtitle}
          </p>
        </div>
      )}
    </div>
  );
}
