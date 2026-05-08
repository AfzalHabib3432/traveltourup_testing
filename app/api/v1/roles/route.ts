import type { NextRequest } from "next/server";
import {
  handleRoleCollectionGET,
  handleRoleCollectionPOST,
} from "@/lib/api/role/role.controller";

export const dynamic = "force-dynamic";

export function GET() {
  return handleRoleCollectionGET();
}

export function POST(req: NextRequest) {
  return handleRoleCollectionPOST(req);
}
