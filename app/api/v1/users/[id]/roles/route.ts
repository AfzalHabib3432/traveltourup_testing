import type { NextRequest } from "next/server";
import { handleUserRolesPUT } from "@/lib/api/user/user.controller";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export function PUT(req: NextRequest, ctx: Ctx) {
  return handleUserRolesPUT(req, ctx.params);
}
