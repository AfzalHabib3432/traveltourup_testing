/** Parse Duffel `order_cancellation` resource from API JSON `data`. */

export type ParsedDuffelOrderCancellation = {
  duffelCancellationId: string;
  duffelOrderId: string;
  refundAmount: string | null;
  refundCurrency: string | null;
  refundTo: string | null;
  quoteExpiresAt: Date | null;
  confirmedAt: Date | null;
  raw: Record<string, unknown>;
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

function parseIsoDate(s: unknown): Date | null {
  if (typeof s !== "string" || !s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function parseDuffelOrderCancellationResponse(raw: unknown): ParsedDuffelOrderCancellation {
  const data = unwrapData(raw);
  if (!data) {
    throw new Error("Invalid Duffel order cancellation response");
  }
  const id = data.id;
  const orderId = data.order_id;
  if (typeof id !== "string" || !id.startsWith("ore_")) {
    throw new Error("Duffel order cancellation missing ore id");
  }
  if (typeof orderId !== "string" || !orderId.startsWith("ord_")) {
    throw new Error("Duffel order cancellation missing order_id");
  }
  const refundAmount = data.refund_amount;
  const refundCurrency = data.refund_currency;
  const refundTo = data.refund_to;
  return {
    duffelCancellationId: id,
    duffelOrderId: orderId,
    refundAmount: typeof refundAmount === "string" ? refundAmount : null,
    refundCurrency: typeof refundCurrency === "string" ? refundCurrency : null,
    refundTo: typeof refundTo === "string" ? refundTo : null,
    quoteExpiresAt: parseIsoDate(data.expires_at),
    confirmedAt: parseIsoDate(data.confirmed_at),
    raw: data as Record<string, unknown>,
  };
}
