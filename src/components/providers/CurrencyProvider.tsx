"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import useSWR from "swr";
import {
  DEFAULT_CURRENCY_CODE,
  isSupportedDisplayCurrency,
} from "@/lib/currency/constants";
import {
  convertBetweenDisplayCurrencies,
  formatMoneyDisplay,
  type FxRatesMap,
  usdToCurrency,
} from "@/lib/currency/format-display";
import { defaultCurrencyForLocale } from "@/lib/currency/locale-default-currency";
import { readCurrencyLocalStorage, writeCurrencyLocalStorage } from "@/lib/currency/storage";
import { setCurrencyCookieClient } from "@/lib/currency/client";
import { routing } from "@/i18n/routing";

function pathnameFromWindow(): string | null {
  if (typeof window === "undefined") return null;
  return window.location.pathname || null;
}

type FxApiPayload = {
  base: string;
  rates: Record<string, number>;
};

async function fetchFxRates(url: string): Promise<FxRatesMap> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`exchange rates ${res.status}`);
  const data = (await res.json()) as FxApiPayload;
  if (!data?.rates || typeof data.rates !== "object") throw new Error("invalid rates payload");
  const normalized: FxRatesMap = {};
  for (const [k, v] of Object.entries(data.rates)) {
    if (typeof v === "number" && Number.isFinite(v)) {
      normalized[k.toUpperCase()] = v;
    }
  }
  normalized[DEFAULT_CURRENCY_CODE] = 1;
  return normalized;
}

function localeFromPathname(pathname: string | null): string | null {
  if (!pathname) return null;
  const seg = pathname.split("/").filter(Boolean)[0];
  if (!seg) return null;
  const locales = routing.locales as readonly string[];
  return locales.includes(seg) ? seg : null;
}

function resolveCurrencyOnMount(initialCookie: string | null | undefined, pathname: string | null): string {
  const fromLs = readCurrencyLocalStorage();
  if (fromLs && isSupportedDisplayCurrency(fromLs)) {
    return fromLs.toUpperCase();
  }
  const cookieNorm = typeof initialCookie === "string" ? initialCookie.trim().toUpperCase() : "";
  if (cookieNorm && isSupportedDisplayCurrency(cookieNorm)) {
    return cookieNorm;
  }
  const localeSeg = localeFromPathname(pathname);
  return normalizeInitial(defaultCurrencyForLocale(localeSeg ?? undefined));
}

type CurrencyProviderProps = {
  children: ReactNode;
  /** Hydration hint from `ttu_currency` cookie (may differ from localStorage until reconcile). */
  initialCurrencyCode?: string | null;
};

type CurrencyContextValue = {
  currencyCode: string;
  setCurrencyCode: (code: string) => void;
  ratesReady: boolean;
  convertFromUsd: (amountUsd: number) => number;
  formatFromUsd: (amountUsd: number, locale?: string) => string;
  formatPrice: (amount: number, sourceCurrency: string, locale?: string) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

function normalizeInitial(code: string | null | undefined): string {
  const c = typeof code === "string" ? code.trim().toUpperCase() : "";
  if (c && isSupportedDisplayCurrency(c)) return c;
  return DEFAULT_CURRENCY_CODE;
}

export function CurrencyProvider({ children, initialCurrencyCode }: CurrencyProviderProps) {
  const [currencyCode, setCurrencyCodeState] = useState<string>(() =>
    normalizeInitial(initialCurrencyCode ?? undefined),
  );

  const { data: rates, error } = useSWR<FxRatesMap, Error>(
    "/api/v1/exchange-rates",
    fetchFxRates,
    { revalidateOnFocus: false, dedupingInterval: 3_600_000 },
  );

  const ratesReady = Boolean(rates && !error);

  useEffect(() => {
    const path = pathnameFromWindow();
    const resolved = resolveCurrencyOnMount(initialCurrencyCode, path);
    setCurrencyCodeState((prev) => (prev === resolved ? prev : resolved));
    writeCurrencyLocalStorage(resolved);
    setCurrencyCookieClient(resolved);
  }, [initialCurrencyCode]);

  const setCurrencyCode = useCallback((code: string) => {
    const c = code.trim().toUpperCase();
    if (!isSupportedDisplayCurrency(c)) return;
    setCurrencyCodeState(c);
    writeCurrencyLocalStorage(c);
    setCurrencyCookieClient(c);
  }, []);

  const convertFromUsd = useCallback(
    (amountUsd: number) => {
      if (!ratesReady || !rates) return amountUsd;
      return usdToCurrency(amountUsd, currencyCode, rates);
    },
    [rates, ratesReady, currencyCode],
  );

  const formatFromUsd = useCallback(
    (amountUsd: number, locale?: string) => {
      if (!ratesReady || !rates) {
        return formatMoneyDisplay(amountUsd, DEFAULT_CURRENCY_CODE, locale);
      }
      const converted = usdToCurrency(amountUsd, currencyCode, rates);
      return formatMoneyDisplay(converted, currencyCode, locale);
    },
    [rates, ratesReady, currencyCode],
  );

  const formatPrice = useCallback(
    (amount: number, sourceCurrency: string, locale?: string) => {
      if (!ratesReady || !rates) {
        const src = sourceCurrency.toUpperCase();
        if (src === DEFAULT_CURRENCY_CODE) {
          return formatMoneyDisplay(amount, DEFAULT_CURRENCY_CODE, locale);
        }
        return formatMoneyDisplay(amount, sourceCurrency, locale);
      }
      const converted = convertBetweenDisplayCurrencies(amount, sourceCurrency, currencyCode, rates);
      return formatMoneyDisplay(converted, currencyCode, locale);
    },
    [rates, ratesReady, currencyCode],
  );

  const value = useMemo(
    () => ({
      currencyCode,
      setCurrencyCode,
      ratesReady,
      convertFromUsd,
      formatFromUsd,
      formatPrice,
    }),
    [currencyCode, setCurrencyCode, ratesReady, convertFromUsd, formatFromUsd, formatPrice],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (ctx === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return ctx;
}
