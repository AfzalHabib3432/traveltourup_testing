import { ISO_3166_1_ALPHA2_CODES_FALLBACK } from "@/data/iso3166-alpha2-fallback";

export type RegionSelectOption = { code: string; label: string };

function listAlpha2RegionCodes(): string[] {
  /** ECMA-402 allows `"region"`; DOM `lib` typings can lag behind implementations. */
  const supportedValuesOf = Intl.supportedValuesOf as
    | ((keyword: string) => readonly string[])
    | undefined;
  if (typeof supportedValuesOf === "function") {
    try {
      return [
        ...new Set(
          supportedValuesOf("region").filter((c) => c.length === 2 && c === c.toUpperCase()),
        ),
      ];
    } catch {
      /* Some runtimes ship ICU without region enumeration (e.g. Node.js). */
    }
  }
  return [...ISO_3166_1_ALPHA2_CODES_FALLBACK];
}

/**
 * Regions/countries the runtime can label via {@link Intl.DisplayNames}, sorted by localized name.
 * Suitable for nationality / country-of-citizenship selectors (ISO 3166-style territories).
 */
export function getRegionSelectOptions(locale: string | undefined): RegionSelectOption[] {
  const locales = locale ? [locale, "en"] : ["en"];
  const dn = new Intl.DisplayNames(locales, { type: "region" });
  const sortLocale = locale ?? "en";
  const out: RegionSelectOption[] = [];
  for (const code of listAlpha2RegionCodes()) {
    const label = dn.of(code);
    if (!label || label === code) continue;
    out.push({ code, label });
  }
  if (out.length === 0) {
    return [
      { code: "US", label: "United States" },
      { code: "GB", label: "United Kingdom" },
      { code: "CA", label: "Canada" },
    ];
  }
  out.sort((a, b) => a.label.localeCompare(b.label, sortLocale, { sensitivity: "base" }));
  return out;
}
