import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * @see https://duffel.com/docs/guides/receiving-webhooks
 */
export function verifyDuffelWebhookSignature(
  secret: string,
  rawBody: string,
  signatureHeader: string | null,
): boolean {
  if (!signatureHeader) {
    return false;
  }
  const pairs = signatureHeader.split(",").map((p) => p.split("="));
  const t = pairs[0]?.[1];
  const v1 = pairs[1]?.[1];
  if (!t || !v1 || typeof t !== "string" || typeof v1 !== "string") {
    return false;
  }

  const prefix = Buffer.from(`${t}.`, "utf8");
  const bodyBuf = Buffer.from(rawBody, "utf8");
  const signedPayload = Buffer.concat([prefix, bodyBuf]);

  const expectedHex = createHmac("sha256", secret).update(signedPayload).digest("hex");

  try {
    const a = Buffer.from(expectedHex, "utf8");
    const b = Buffer.from(v1.toLowerCase(), "utf8");
    if (a.length !== b.length) {
      return false;
    }
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
