import "server-only";

import { cookies } from "next/headers";
import { CURRENCY_COOKIE, DEFAULT_CURRENCY_CODE } from "@/lib/currency/constants";

export async function getCurrencyCode(): Promise<string> {
  const store = await cookies();
  return store.get(CURRENCY_COOKIE)?.value ?? DEFAULT_CURRENCY_CODE;
}
