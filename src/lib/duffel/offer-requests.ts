import "server-only";
import { duffelFetch } from "./client";

/** @see https://duffel.com/docs/api/v2/offer-requests/create-offer-request — optional `createOfferRequest` query params */
export function createOfferRequest(
  data: object,
  opts?: { supplier_timeout_ms?: number },
) {
  const qs = new URLSearchParams();
  if (opts?.supplier_timeout_ms != null && opts.supplier_timeout_ms > 0) {
    qs.set("supplier_timeout", String(Math.round(opts.supplier_timeout_ms)));
  }
  const suffix = qs.toString() ? `?${qs}` : "";
  return duffelFetch<unknown>(`/air/offer_requests${suffix}`, {
    method: "POST",
    body: JSON.stringify({ data }),
  });
}

/** Retrieve offer request (includes `offers` per Duffel). */
export function getOfferRequest(offerRequestId: string) {
  return duffelFetch<unknown>(
    `/air/offer_requests/${encodeURIComponent(offerRequestId)}`,
    { method: "GET" },
  );
}
