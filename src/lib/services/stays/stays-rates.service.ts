import "server-only";

import { staysFetchAllRates } from "@/lib/duffel/stays-http";
import { parseStaysFetchAllRates } from "@/lib/duffel/stays-parse";

export async function runStaysFetchAllRates(searchResultId: string) {
  const raw = await staysFetchAllRates(searchResultId);
  const payload = parseStaysFetchAllRates(raw, searchResultId);
  if (!payload) {
    throw new Error("Unable to parse stays rates response");
  }
  return payload;
}
