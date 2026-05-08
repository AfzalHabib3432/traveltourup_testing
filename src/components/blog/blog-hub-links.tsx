"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Plane, Building2, Car } from "lucide-react";

export function BlogHubLinks() {
  const t = useTranslations("Blog");

  const links = [
    { href: "/flights" as const, label: t("hubLinksFlights"), Icon: Plane },
    { href: "/hotels" as const, label: t("hubLinksHotels"), Icon: Building2 },
    { href: "/cars" as const, label: t("hubLinksCars"), Icon: Car },
  ];

  return (
    <nav
      aria-label={t("hubLinksAria")}
      className="mt-6 rounded-2xl border border-border/50 bg-muted/40 px-5 py-4 sm:px-6"
    >
      <p className="text-sm font-semibold text-foreground">{t("hubLinksTitle")}</p>
      <ul className="mt-3 flex flex-wrap gap-2 sm:gap-3">
        {links.map(({ href, label, Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-background/80 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
