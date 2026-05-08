import "server-only";

import { staysCreateQuote } from "@/lib/duffel/stays-http";
import { parseStaysQuote } from "@/lib/duffel/stays-parse";

export async function runStaysCreateQuote(rateId: string) {
  const raw = await staysCreateQuote(rateId);
  const quote = parseStaysQuote(raw, rateId);
  if (!quote) {
    throw new Error("Unable to parse stays quote response");
  }
  return quote;
}
