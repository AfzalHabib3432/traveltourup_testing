import "server-only";

/**
 * POST /api/email/send — shared by web (server actions / Route Handlers) and mobile backends.
 * Accepts legacy payloads (`props`) and generic payloads (`data` + optional `subType` for bookings).
 *
 * Web: call from Route Handlers or server actions only (never expose EMAIL_SERVER_SECRET to the browser).
 * Mobile: call from your backend with the same Bearer secret; do not embed the secret in the app binary.
 *
 * Example:
 * curl -X POST "$NEXT_PUBLIC_APP_URL/api/email/send" \
 *   -H "Authorization: Bearer $EMAIL_SERVER_SECRET" \
 *   -H "Content-Type: application/json" \
 *   -d '{"type":"booking_confirmation","to":"guest@example.com","props":{"bookingReference":"ABC","guestName":"Jane","destination":"Tokyo","dates":"May 1–7","total":"USD 1,200"}}'
 */

import { NextResponse, type NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/error-handler";
import { successResponse } from "@/lib/api/response";
import { clientIpFromHeaders, rateLimitByKey } from "@/lib/api/rate-limit-ip";
import { sendEmail } from "@/lib/email";
import { parseEmailSendRequest } from "@/lib/validations/email.schema";

const SEND_LIMIT_PER_MINUTE = 60;

function jsonError(message: string, status: number, code: string) {
  return NextResponse.json({ success: false as const, code, message }, { status });
}

function assertEmailServerAuth(req: NextRequest): NextResponse | null {
  const expected = process.env.EMAIL_SERVER_SECRET?.trim();
  if (!expected) {
    console.error("[email] EMAIL_SERVER_SECRET is not configured");
    return jsonError("Email service is not configured.", 503, "EMAIL_NOT_CONFIGURED");
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${expected}`) {
    return jsonError("Unauthorized.", 401, "UNAUTHORIZED");
  }
  return null;
}

export async function handleSendEmail(req: NextRequest): Promise<Response> {
  try {
    const authErr = assertEmailServerAuth(req);
    if (authErr) return authErr;

    const ip = clientIpFromHeaders((name) => req.headers.get(name));
    const limited = rateLimitByKey(`email-send:${ip}`, SEND_LIMIT_PER_MINUTE);
    if (!limited.ok) {
      return NextResponse.json(
        {
          success: false as const,
          code: "RATE_LIMITED" as const,
          message: "Too many requests. Try again later.",
          retry_after_sec: limited.retryAfterSec,
        },
        { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
      );
    }

    const body = await req.json();
    const parsed = parseEmailSendRequest(body);
    const result = await sendEmail(parsed);
    return successResponse({ id: result.id });
  } catch (error) {
    return handleApiError(error);
  }
}

export function handleSendEmailOptions(): Response {
  return new NextResponse(null, { status: 204 });
}
