import { prisma } from "@/lib/prisma";

/** Server-only helpers — enforce `requirePermission(..., "admin.rbac:manage")` (or equivalent) in the API / action. */

export async function assignRoleToUser(
  userId: string,
  roleId: string,
  options?: { isPrimary?: boolean },
) {
  const isPrimary = options?.isPrimary ?? false;

  if (isPrimary) {
    await prisma.userRole.updateMany({
      where: { user_id: userId },
      data: { is_primary: false },
    });
  }

  await prisma.userRole.upsert({
    where: {
      user_id_role_id: { user_id: userId, role_id: roleId },
    },
    create: {
      user_id: userId,
      role_id: roleId,
      is_primary: isPrimary,
    },
    update: {
      is_primary: isPrimary,
    },
  });
}

/** Idempotent: no error if the assignment did not exist. */
export async function removeRoleFromUser(userId: string, roleId: string) {
  await prisma.userRole.deleteMany({
    where: { user_id: userId, role_id: roleId },
  });
}

export async function grantUserPermission(userId: string, permissionId: string) {
  await prisma.userPermissionGrant.upsert({
    where: {
      user_id_permission_id: { user_id: userId, permission_id: permissionId },
    },
    create: { user_id: userId, permission_id: permissionId },
    update: {},
  });
}

export async function revokeUserPermission(userId: string, permissionId: string) {
  await prisma.userPermissionGrant.deleteMany({
    where: { user_id: userId, permission_id: permissionId },
  });
}
