import { CURRENCY_COOKIE } from "@/lib/currency/constants";

const ONE_YEAR_SEC = 60 * 60 * 24 * 365;

export function setCurrencyCookieClient(code: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${CURRENCY_COOKIE}=${encodeURIComponent(code)};path=/;max-age=${ONE_YEAR_SEC};SameSite=Lax`;
}
