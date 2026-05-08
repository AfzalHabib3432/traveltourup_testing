import type { NextRequest } from "next/server";
import { handleLogin } from "@/lib/api/auth/auth.controller";

export const dynamic = "force-dynamic";

export function POST(req: NextRequest) {
  return handleLogin(req);
}
