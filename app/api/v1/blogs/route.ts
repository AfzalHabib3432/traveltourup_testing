import { NextRequest } from "next/server";
import {
  handleBlogCollectionGET,
  handleBlogCollectionPOST,
} from "@/lib/api/blog/blog.controller";
import { withPermissionRoute } from "@/lib/api/with-route-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleBlogCollectionGET(req);
}

export async function POST(req: NextRequest) {
  return withPermissionRoute("admin.blogs:write", () => handleBlogCollectionPOST(req));
}
