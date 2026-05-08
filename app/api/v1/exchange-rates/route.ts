import { NextResponse } from "next/server";

export const revalidate = 3600;

const OPEN_ER = "https://open.er-api.com/v6/latest/USD";

/**
 * Cached FX snapshot for display-only conversion (USD base).
 * Uses open.er-api.com so PKR/SAR are available (Frankfurter/ECB omits them).
 */
export async function GET() {
  try {
    const res = await fetch(OPEN_ER, { next: { revalidate } });
    if (!res.ok) {
      return NextResponse.json({ error: "upstream_failed" }, { status: 502 });
    }
    const data = (await res.json()) as {
      result?: string;
      base_code?: string;
      rates?: Record<string, number>;
      time_last_update_utc?: string;
    };
    if (data.result !== "success" || !data.rates || typeof data.rates !== "object") {
      return NextResponse.json({ error: "invalid_payload" }, { status: 502 });
    }
    const pick = ["EUR", "PKR", "SAR"] as const;
    const rates: Record<string, number> = { USD: 1 };
    for (const code of pick) {
      const v = data.rates[code];
      if (typeof v === "number" && Number.isFinite(v)) {
        rates[code] = v;
      }
    }
    return NextResponse.json({
      base: "USD",
      rates,
      date: data.time_last_update_utc ?? null,
    });
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
}
