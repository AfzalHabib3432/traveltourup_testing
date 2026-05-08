import "server-only";
import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { applyDuffelWebhookEventSideEffects } from "@/lib/services/duffel/duffel-webhook-handlers";

/**
 * Persist Duffel webhook (dedupe by `event_id`). If the event was already processed, skip.
 * If a row exists but never succeeded (`processed_at` null), re-run side effects so Duffel retries work.
 */
export async function recordDuffelWebhookEvent(payload: Prisma.InputJsonValue) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Duffel webhook payload must be a JSON object");
  }
  const obj = payload as Record<string, unknown>;
  const eventId = obj.id;
  const type = obj.type;

  if (typeof eventId !== "string" || !eventId) {
    throw new Error("Duffel webhook payload missing string id");
  }
  if (typeof type !== "string" || !type) {
    throw new Error("Duffel webhook payload missing string type");
  }

  const existing = await prisma.duffelWebhookEvent.findUnique({
    where: { event_id: eventId },
  });

  if (existing?.processed_at) {
    return { duplicate: true as const };
  }

  if (!existing) {
    await prisma.duffelWebhookEvent.create({
      data: {
        event_id: eventId,
        type,
        payload,
        processed_at: null,
      },
    });
  }

  try {
    await applyDuffelWebhookEventSideEffects(obj);
    await prisma.duffelWebhookEvent.update({
      where: { event_id: eventId },
      data: { processed_at: new Date(), error: null },
    });
  } catch (inner) {
    const msg = inner instanceof Error ? inner.message : String(inner);
    await prisma.duffelWebhookEvent.update({
      where: { event_id: eventId },
      data: { error: msg },
    });
    throw inner;
  }

  return { duplicate: false as const };
}
