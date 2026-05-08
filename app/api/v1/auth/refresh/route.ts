import type { NextRequest } from "next/server";
import { handleRefresh } from "@/lib/api/auth/auth.controller";

export const dynamic = "force-dynamic";

export function POST(req: NextRequest) {
  return handleRefresh(req);
}
