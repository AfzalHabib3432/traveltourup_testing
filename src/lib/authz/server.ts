import { cache } from "react";
import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import type { PermissionId } from "@/lib/authz/registry";
import {
  hasAllPermissions as hasAllPerm,
  hasAnyPermission as hasAnyPerm,
  hasAnyRole,
  hasPermission as hasPerm,
  hasRole,
  pickPrimaryRoleId,
} from "@/lib/authz/guards";
import type { AuthzContext } from "./types";
import { ForbiddenError, UnauthorizedError } from "./errors";

export type { AuthzContext } from "./types";

async function loadResolvedPermissionIds(userId: string): Promise<string[]> {
  const rows = await prisma.$queryRaw<Array<{ permission_id: string }>>(
    Prisma.sql`
      SELECT DISTINCT t.permission_id
      FROM (
        SELECT rp.permission_id
        FROM user_roles ur
        INNER JOIN role_permissions rp ON rp.role_id = ur.role_id
        WHERE ur.user_id = ${userId}::uuid
        UNION
        SELECT upg.permission_id
        FROM user_permission_grants upg
        WHERE upg.user_id = ${userId}::uuid
      ) AS t(permission_id)
    `,
  );
  return rows.map((r) => r.permission_id);
}

async function loadUserRoleAssignments(userId: string): Promise<Array<{ role_id: string; is_primary: boolean }>> {
  return prisma.userRole.findMany({
    where: { user_id: userId },
    select: { role_id: true, is_primary: true },
    orderBy: { created_at: "asc" },
  });
}

async function loadAuthzContextForUserId(userId: string): Promise<AuthzContext | null> {
  const profile = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!profile) {
    return null;
  }

  const [assignments, permissionIds] = await Promise.all([
    loadUserRoleAssignments(userId),
    loadResolvedPermissionIds(userId),
  ]);

  const roleIds = assignments.map((a) => a.role_id);

  return {
    userId: profile.id,
    roleIds,
    primaryRoleId: pickPrimaryRoleId(assignments),
    permissions: new Set(permissionIds),
  };
}

/**
 * One DB resolution per React / Next request when called repeatedly (Server Components, etc.).
 * Route Handlers: still correct; deduplication may be limited outside the React render pass.
 */
export const getAuthzContextForUserId = cache(loadAuthzContextForUserId);

export async function getPermissionSlugsForUserId(userId: string): Promise<ReadonlySet<string>> {
  const ctx = await getAuthzContextForUserId(userId);
  return ctx?.permissions ?? new Set();
}

export function hasPermission(ctx: AuthzContext | null, permission: PermissionId | string): boolean {
  return hasPerm(ctx, permission);
}

export { hasResourceAction, hasRole, hasAnyRole, hasAllPermissions, hasAnyPermission } from "./guards";

export async function userHasPermission(userId: string, permission: PermissionId | string): Promise<boolean> {
  const ctx = await getAuthzContextForUserId(userId);
  return hasPerm(ctx, permission);
}

// ---------------------------------------------------------------------------
// Synchronous assert guards — operate on an already-loaded AuthzContext.
// Prefer these over the async `require*` variants to avoid duplicate DB loads.
// ---------------------------------------------------------------------------

export function assertUserId(
  userId: string | null | undefined,
): asserts userId is string {
  if (!userId) throw new UnauthorizedError();
}

export function assertPermission(
  authz: AuthzContext | null | undefined,
  permission: PermissionId | string,
): asserts authz is AuthzContext {
  if (!authz || !hasPerm(authz, permission)) {
    throw new ForbiddenError(`Missing permission: ${permission}`);
  }
}

export function assertAnyPermission(
  authz: AuthzContext | null | undefined,
  permissions: readonly (PermissionId | string)[],
): asserts authz is AuthzContext {
  if (!authz || !hasAnyPerm(authz, permissions)) {
    throw new ForbiddenError();
  }
}

export function assertAllPermissions(
  authz: AuthzContext | null | undefined,
  permissions: readonly (PermissionId | string)[],
): asserts authz is AuthzContext {
  if (!authz || !hasAllPerm(authz, permissions)) {
    throw new ForbiddenError();
  }
}

export function assertRole(
  authz: AuthzContext | null | undefined,
  roleId: string,
): asserts authz is AuthzContext {
  if (!authz || !hasRole(authz, roleId)) {
    throw new ForbiddenError(`Missing role: ${roleId}`);
  }
}

export function assertAnyRole(
  authz: AuthzContext | null | undefined,
  roleIds: readonly string[],
): asserts authz is AuthzContext {
  if (!authz || !hasAnyRole(authz, roleIds)) {
    throw new ForbiddenError();
  }
}

// ---------------------------------------------------------------------------
// Async require* variants — re-fetch AuthzContext from DB via userId.
// @deprecated Prefer assertPermission / assertUserId with the authz returned
// by getServerAuthz() to avoid duplicate DB round-trips.
// ---------------------------------------------------------------------------

/** @deprecated Use {@link assertUserId} instead. */
export async function requireUserId(userId: string | null | undefined): Promise<string> {
  if (!userId) {
    throw new UnauthorizedError();
  }
  return userId;
}

/** @deprecated Use {@link assertPermission} with authz from getServerAuthz(). */
export async function requirePermission(
  userId: string | null | undefined,
  permission: PermissionId | string,
): Promise<AuthzContext> {
  const id = await requireUserId(userId);
  const ctx = await getAuthzContextForUserId(id);
  if (!ctx || !hasPerm(ctx, permission)) {
    throw new ForbiddenError(`Missing permission: ${permission}`);
  }
  return ctx;
}

/** @deprecated Use {@link assertAnyPermission} with authz from getServerAuthz(). */
export async function requireAnyPermission(
  userId: string | null | undefined,
  permissions: readonly (PermissionId | string)[],
): Promise<AuthzContext> {
  const id = await requireUserId(userId);
  const ctx = await getAuthzContextForUserId(id);
  if (!ctx || !hasAnyPerm(ctx, permissions)) {
    throw new ForbiddenError();
  }
  return ctx;
}

/** @deprecated Use {@link assertAllPermissions} with authz from getServerAuthz(). */
export async function requireAllPermissions(
  userId: string | null | undefined,
  permissions: readonly (PermissionId | string)[],
): Promise<AuthzContext> {
  const id = await requireUserId(userId);
  const ctx = await getAuthzContextForUserId(id);
  if (!ctx || !hasAllPerm(ctx, permissions)) {
    throw new ForbiddenError();
  }
  return ctx;
}

/** @deprecated Use {@link assertRole} with authz from getServerAuthz(). */
export async function requireRole(userId: string | null | undefined, roleId: string): Promise<AuthzContext> {
  const id = await requireUserId(userId);
  const ctx = await getAuthzContextForUserId(id);
  if (!ctx || !hasRole(ctx, roleId)) {
    throw new ForbiddenError(`Missing role: ${roleId}`);
  }
  return ctx;
}

/** @deprecated Use {@link assertAnyRole} with authz from getServerAuthz(). */
export async function requireAnyRole(
  userId: string | null | undefined,
  roleIds: readonly string[],
): Promise<AuthzContext> {
  const id = await requireUserId(userId);
  const ctx = await getAuthzContextForUserId(id);
  if (!ctx || !hasAnyRole(ctx, roleIds)) {
    throw new ForbiddenError();
  }
  return ctx;
}
