import { handlePermissionsGET } from "@/lib/api/role/role.controller";

export const dynamic = "force-dynamic";

export function GET() {
  return handlePermissionsGET();
}
