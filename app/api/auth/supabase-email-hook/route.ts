import type { NextRequest } from "next/server";
import { handleSupabaseEmailHook } from "@/lib/api/email/supabase-email-hook.controller";

export const dynamic = "force-dynamic";

export function POST(req: NextRequest) {
  return handleSupabaseEmailHook(req);
}
