import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma";
import { getDuffelWebhookSecret } from "@/lib/duffel/config";
import { verifyDuffelWebhookSignature } from "@/lib/duffel/webhook-verify";
import { recordDuffelWebhookEvent } from "@/lib/services/duffel/duffel-webhook.service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = getDuffelWebhookSecret();
  if (!secret) {
    return NextResponse.json(
      { success: false as const, code: "WEBHOOK_NOT_CONFIGURED" as const },
      { status: 503 },
    );
  }

  const raw = await request.text();
  const sig = request.headers.get("X-Duffel-Signature");
  if (!verifyDuffelWebhookSignature(secret, raw, sig)) {
    return NextResponse.json(
      { success: false as const, code: "INVALID_SIGNATURE" as const },
      { status: 401 },
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return NextResponse.json(
      { success: false as const, code: "INVALID_JSON" as const },
      { status: 400 },
    );
  }

  if (!parsed || typeof parsed !== "object") {
    return NextResponse.json(
      { success: false as const, code: "INVALID_JSON" as const },
      { status: 400 },
    );
  }

  try {
    const result = await recordDuffelWebhookEvent(parsed as Prisma.InputJsonValue);
    if (result.duplicate) {
      return NextResponse.json({ success: true as const, duplicate: true as const });
    }
    return NextResponse.json({ success: true as const, duplicate: false as const });
  } catch (err) {
    console.error("Duffel webhook persist error:", err);
    return NextResponse.json(
      { success: false as const, code: "WEBHOOK_PROCESS_ERROR" as const },
      { status: 500 },
    );
  }
}
