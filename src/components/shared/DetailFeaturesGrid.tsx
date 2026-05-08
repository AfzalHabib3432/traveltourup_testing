"use client";

import React from "react";
import { useLocale } from "next-intl";

export interface DetailFeatureItem {
  icon: React.ReactNode;
  label: string;
}

export interface DetailFeaturesGridProps {
  title: string;
  description?: string;
  features: DetailFeatureItem[];
}

/**
 * Features/amenities section with icon grid.
 * Heading, optional description, then 3-column feature grid.
 */
export function DetailFeaturesGrid({
  title,
  description,
  features,
}: DetailFeaturesGridProps) {
  const locale = useLocale();
  const isRtl = locale === "ar" || locale === "ur";

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="pt-8 border-t border-border">
      <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
      {description && (
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
        {features.map((f, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
          >
            <div className="shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              {f.icon}
            </div>
            <span className="text-sm font-semibold text-foreground truncate">
              {f.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
