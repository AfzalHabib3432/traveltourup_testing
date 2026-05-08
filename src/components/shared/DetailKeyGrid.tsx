"use client";

import React from "react";
import { useLocale } from "next-intl";

export interface DetailKeyItem {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
}

export interface DetailKeyGridProps {
  items: DetailKeyItem[];
  columns?: 2 | 3;
}

/**
 * Reusable key details grid: icon + label + value.
 * Matches the design: light blue circular icon bg, bold label, grey value.
 */
export function DetailKeyGrid({
  items,
  columns = 3,
}: DetailKeyGridProps) {
  const locale = useLocale();
  const isRtl = locale === "ar" || locale === "ur";

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className={`grid gap-3 md:gap-4 ${
        columns === 3
          ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1 sm:grid-cols-2"
      }`}
    >
      {items.map((item, i) => (
        <div key={i} className="flex gap-3">
          <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {item.icon}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground">
              {item.label}
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">
              {item.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
