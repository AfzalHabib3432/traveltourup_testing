import { DEFAULT_CURRENCY_CODE } from "@/lib/currency/constants";

export type FxRatesMap = Record<string, number>;

/** 1 USD expressed in `currency` (Frankfurter-style: multiply USD amount by this to get target units). */
export function usdToCurrency(amountUsd: number, targetCurrency: string, rates: FxRatesMap | null): number {
  if (!Number.isFinite(amountUsd)) return amountUsd;
  const target = targetCurrency.toUpperCase();
  if (target === DEFAULT_CURRENCY_CODE) return amountUsd;
  const r = rates?.[target];
  if (typeof r !== "number" || !Number.isFinite(r)) return amountUsd;
  return amountUsd * r;
}

/** Convert amount from `sourceCurrency` to USD using Frankfurter-style rates (USD base map). */
export function currencyToUsd(amount: number, sourceCurrency: string, rates: FxRatesMap | null): number {
  if (!Number.isFinite(amount)) return amount;
  const src = sourceCurrency.toUpperCase();
  if (src === DEFAULT_CURRENCY_CODE) return amount;
  const r = rates?.[src];
  if (typeof r !== "number" || !Number.isFinite(r) || r === 0) return amount;
  return amount / r;
}

export function convertBetweenDisplayCurrencies(
  amount: number,
  sourceCurrency: string,
  targetCurrency: string,
  rates: FxRatesMap | null,
): number {
  const usd = currencyToUsd(amount, sourceCurrency, rates);
  return usdToCurrency(usd, targetCurrency, rates);
}

/** Parses lines stored as `EUR 123.45` (ISO code + amount) for checkout summaries. */
export function parseIsoCurrencyAmountLine(line: string | undefined): {
  amount: number;
  currency: string;
} | null {
  if (!line?.trim()) return null;
  const m = line.trim().match(/^([A-Za-z]{3})\s+([\d.,]+)\s*$/);
  if (!m) return null;
  const amount = Number.parseFloat(m[2].replace(/,/g, ""));
  if (!Number.isFinite(amount)) return null;
  return { currency: m[1].toUpperCase(), amount };
}

export function formatMoneyDisplay(
  amount: number,
  currencyCode: string,
  locale?: string,
): string {
  if (!Number.isFinite(amount)) return "";
  try {
    return new Intl.NumberFormat(locale || undefined, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}
