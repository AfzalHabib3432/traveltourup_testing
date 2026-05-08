import type { NextRequest } from "next/server";
import {
  handleRoleItemGET,
  handleRoleItemPATCH,
  handleRoleItemDELETE,
} from "@/lib/api/role/role.controller";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export function GET(req: NextRequest, ctx: Ctx) {
  return handleRoleItemGET(req, ctx.params);
}

export function PATCH(req: NextRequest, ctx: Ctx) {
  return handleRoleItemPATCH(req, ctx.params);
}

export function DELETE(req: NextRequest, ctx: Ctx) {
  return handleRoleItemDELETE(req, ctx.params);
}
