import { CURRENCY_LOCAL_STORAGE_KEY } from "@/lib/currency/constants";

export function readCurrencyLocalStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CURRENCY_LOCAL_STORAGE_KEY);
    return raw?.trim() ? raw.trim().toUpperCase() : null;
  } catch {
    return null;
  }
}

export function writeCurrencyLocalStorage(code: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CURRENCY_LOCAL_STORAGE_KEY, code.toUpperCase());
  } catch {
    /* quota / private mode */
  }
}
