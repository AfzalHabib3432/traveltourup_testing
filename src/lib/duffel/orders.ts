import "server-only";
import { duffelFetch } from "./client";

/** Create air order (full payload in P2). */
export function createOrder(data: object) {
  return duffelFetch<unknown>("/air/orders", {
    method: "POST",
    body: JSON.stringify({ data }),
  });
}

/** `GET /air/orders/:id` — webhook sync / support. */
export function getDuffelOrder(orderId: string) {
  return duffelFetch<unknown>(`/air/orders/${encodeURIComponent(orderId)}`);
}
