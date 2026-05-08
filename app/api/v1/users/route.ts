import type { NextRequest } from "next/server";
import {
  handleUserCollectionGET,
  handleUserCollectionPOST,
} from "@/lib/api/user/user.controller";

export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  return handleUserCollectionGET(req);
}

export function POST(req: NextRequest) {
  return handleUserCollectionPOST(req);
}
