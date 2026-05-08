import { NextResponse } from "next/server";
import { successResponse } from "@/lib/api/response";
import { getServerAuthz } from "@/lib/authz/session";
import { hasPermission } from "@/lib/authz/guards";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId, authz } = await getServerAuthz();

  if (!userId) {
    return NextResponse.json(
      { success: false as const, code: "UNAUTHORIZED" as const, message: "Not authenticated" },
      { status: 401 },
    );
  }

  if (!authz) {
    return successResponse({
      authenticated: true,
      userId,
      profileExists: false,
      message: "Call ensureUserProfileForAuthUser after sign-up so RBAC can resolve.",
    });
  }

  const canManageRbac = hasPermission(authz, "admin.rbac:manage");

  return successResponse({
    authenticated: true,
    profileExists: true,
    userId: authz.userId,
    roleIds: authz.roleIds,
    primaryRoleId: authz.primaryRoleId,
    permissionSlugs: [...authz.permissions].sort(),
    flags: { canManageRbac },
  });
}
