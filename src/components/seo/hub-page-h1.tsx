"use client";

import { useTranslations } from "next-intl";

type HubPage = "Flights" | "Hotels" | "Cars";

/** Screen-reader page title aligned with hub intent (visible UI keeps focus on search widgets). */
export function HubPageH1({ page }: { page: HubPage }) {
  const t = useTranslations(page);
  return <h1 className="sr-only">{t("pageH1")}</h1>;
}
