import type { NextRequest } from "next/server";
import { handleSendEmail, handleSendEmailOptions } from "@/lib/api/email/email.controller";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleSendEmailOptions();
}

export function POST(req: NextRequest) {
  return handleSendEmail(req);
}
