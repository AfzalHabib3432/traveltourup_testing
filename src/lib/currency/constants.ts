export const CURRENCY_COOKIE = "ttu_currency";

/** Client persistence (dual-write with cookie). */
export const CURRENCY_LOCAL_STORAGE_KEY = "ttu_currency";

export const DEFAULT_CURRENCY_CODE = "USD";

/** ISO codes supported by the marketing currency picker — aligned with `CURRENCIES` in navbar.config. */
export const SUPPORTED_DISPLAY_CURRENCIES = ["USD", "PKR", "SAR", "EUR"] as const;
export type SupportedDisplayCurrency = (typeof SUPPORTED_DISPLAY_CURRENCIES)[number];

export function isSupportedDisplayCurrency(code: string): code is SupportedDisplayCurrency {
  return (SUPPORTED_DISPLAY_CURRENCIES as readonly string[]).includes(code.toUpperCase());
}
