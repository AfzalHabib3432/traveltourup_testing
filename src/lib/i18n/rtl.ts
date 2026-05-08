import type { AppLocale } from "@/i18n/routing";

/** Locales that use Arabic script / RTL reading flow for body copy (layout chrome stays LTR). */
export const RTL_LOCALES = ["ar", "ur"] as const satisfies readonly AppLocale[];

export function isRtlLocale(locale: string): boolean {
  return (RTL_LOCALES as readonly string[]).includes(locale);
}
