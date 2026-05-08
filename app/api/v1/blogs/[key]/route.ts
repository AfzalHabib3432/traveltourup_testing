import { NextRequest } from "next/server";
import {
  handleBlogItemDELETE,
  handleBlogItemGET,
  handleBlogItemPATCH,
} from "@/lib/api/blog/blog.controller";
import { withPermissionRoute } from "@/lib/api/with-route-auth";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ key: string }> };

export async function GET(req: NextRequest, ctx: RouteContext) {
  return handleBlogItemGET(req, ctx.params);
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  return withPermissionRoute("admin.blogs:write", () => handleBlogItemPATCH(req, ctx.params));
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  return withPermissionRoute("admin.blogs:delete", () => handleBlogItemDELETE(req, ctx.params));
}
