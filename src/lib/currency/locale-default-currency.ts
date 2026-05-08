import type { AppLocale } from "@/i18n/routing";

/** Display default when user has no saved preference (first visit). Separate from language after persist. */
export const LOCALE_DEFAULT_CURRENCY: Record<AppLocale, string> = {
  en: "USD",
  ur: "PKR",
  ar: "SAR",
  fr: "EUR",
  ru: "USD",
};

export function defaultCurrencyForLocale(locale: string | null | undefined): string {
  if (!locale) return "USD";
  const code = locale.toLowerCase();
  if (code in LOCALE_DEFAULT_CURRENCY) {
    return LOCALE_DEFAULT_CURRENCY[code as AppLocale];
  }
  return "USD";
}
