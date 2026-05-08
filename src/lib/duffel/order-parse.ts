/** Extract fields from Duffel `POST /air/orders` (or get order) JSON. */

import type { Prisma } from "@/generated/prisma";

export type ParsedOrderAncillaryRow = {
  type: string;
  duffel_service_id: string | null;
  passenger_id: string | null;
  segment_id: string | null;
  amount: string | null;
  currency: string | null;
  status: string | null;
  raw: Prisma.InputJsonValue;
};

/** Maps `order.services` from a Duffel order `data` object into DB rows. */
export function parseDuffelOrderServicesForDb(data: Record<string, unknown>): ParsedOrderAncillaryRow[] {
  const services = data.services;
  if (!Array.isArray(services)) return [];
  const out: ParsedOrderAncillaryRow[] = [];
  for (const s of services) {
    if (!s || typeof s !== "object") continue;
    const o = s as Record<string, unknown>;
    const id = o.id;
    const typ = o.type;
    const total_amount = o.total_amount;
    const total_currency = o.total_currency;
    const st = o.status;
    const segment_ids = o.segment_ids;
    const passenger_ids = o.passenger_ids;
    let segment_id: string | null = null;
    if (Array.isArray(segment_ids) && typeof segment_ids[0] === "string") {
      segment_id = segment_ids[0];
    }
    let passenger_id: string | null = null;
    if (Array.isArray(passenger_ids) && typeof passenger_ids[0] === "string") {
      passenger_id = passenger_ids[0];
    }
    out.push({
      type: typeof typ === "string" ? typ : "other",
      duffel_service_id: typeof id === "string" ? id : null,
      passenger_id,
      segment_id,
      amount: typeof total_amount === "string" ? total_amount : null,
      currency: typeof total_currency === "string" ? total_currency : null,
      status: typeof st === "string" ? st : null,
      raw: o as unknown as Prisma.InputJsonValue,
    });
  }
  return out;
}

export type ParsedDuffelOrder = {
  orderId: string;
  bookingReference: string | null;
  totalAmount: string;
  totalCurrency: string;
  liveMode: boolean;
  offerId: string | null;
  /** Full `data` object for auditing. */
  data: Record<string, unknown>;
};

function unwrapData(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object") return null;
  const root = raw as Record<string, unknown>;
  const data = root.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }
  return root;
}

export function parseDuffelOrderResponse(raw: unknown): ParsedDuffelOrder {
  const data = unwrapData(raw);
  if (!data) {
    throw new Error("Invalid Duffel order response");
  }
  const id = data.id;
  if (typeof id !== "string" || !id.startsWith("ord_")) {
    throw new Error("Duffel order response missing order id");
  }
  const totalAmount = data.total_amount;
  const totalCurrency = data.total_currency;
  if (typeof totalAmount !== "string" || typeof totalCurrency !== "string") {
    throw new Error("Duffel order missing total_amount or total_currency");
  }
  const br = data.booking_reference;
  const offerId = data.offer_id;
  return {
    orderId: id,
    bookingReference: typeof br === "string" ? br : null,
    totalAmount,
    totalCurrency,
    liveMode: data.live_mode === true,
    offerId: typeof offerId === "string" ? offerId : null,
    data: data as Record<string, unknown>,
  };
}
