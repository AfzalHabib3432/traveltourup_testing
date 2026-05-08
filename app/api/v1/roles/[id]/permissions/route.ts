import type { NextRequest } from "next/server";
import { handleRolePermissionsPUT } from "@/lib/api/role/role.controller";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export function PUT(req: NextRequest, ctx: Ctx) {
  return handleRolePermissionsPUT(req, ctx.params);
}
