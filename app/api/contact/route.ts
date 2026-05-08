import { NextResponse } from "next/server";
import { getServerAuthz } from "@/lib/authz";
import { clientIpFromHeaders, rateLimitByKey } from "@/lib/api/rate-limit-ip";
import { sendContactMessage } from "@/lib/services/contact.service";
import { contactMessageSchema } from "@/lib/validations/contact";

export const dynamic = "force-dynamic";

// TODO: captcha (e.g. Cloudflare Turnstile) when product requires it

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid input" },
      { status: 400 },
    );
  }

  const parsed = contactMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid input" },
      { status: 400 },
    );
  }

  const ip = clientIpFromHeaders((n) => request.headers.get(n));
  const limit = rateLimitByKey(`contact:ip:${ip}`, 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { success: false, error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSec) },
      },
    );
  }

  const { userId } = await getServerAuthz();
  const submissionId = crypto.randomUUID();

  try {
    await sendContactMessage({
      ...parsed.data,
      userId,
      submissionId,
    });
  } catch (err) {
    console.error("[api/contact] send failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true as const });
}
