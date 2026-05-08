import type { NextRequest } from "next/server";
import {
  handleMyProfileGET,
  handleMyProfilePATCH,
} from "@/lib/api/user/user.controller";

export const dynamic = "force-dynamic";

export function GET() {
  return handleMyProfileGET();
}

export function PATCH(req: NextRequest) {
  return handleMyProfilePATCH(req);
}
