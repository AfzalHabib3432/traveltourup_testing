import "server-only";

import { duffelStaysSearch } from "@/lib/duffel/stays";
import { parseStaysSearchResults } from "@/lib/duffel/stays-parse";
import type { StaysSearchBodyInput } from "@/lib/validations/stays.schema";

export async function runStaysSearch(body: StaysSearchBodyInput) {
  const raw = await duffelStaysSearch(body);
  const results = parseStaysSearchResults(raw);
  return { results, raw_meta: { count: results.length } };
}
