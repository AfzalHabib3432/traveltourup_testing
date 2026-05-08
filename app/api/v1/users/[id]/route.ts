import type { NextRequest } from "next/server";
import {
  handleUserItemGET,
  handleUserItemPATCH,
  handleUserItemDELETE,
} from "@/lib/api/user/user.controller";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export function GET(req: NextRequest, ctx: Ctx) {
  return handleUserItemGET(req, ctx.params);
}

export function PATCH(req: NextRequest, ctx: Ctx) {
  return handleUserItemPATCH(req, ctx.params);
}

export function DELETE(req: NextRequest, ctx: Ctx) {
  return handleUserItemDELETE(req, ctx.params);
}
