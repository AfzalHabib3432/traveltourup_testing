import type { PermissionId } from "@/lib/authz/registry";
import type { AuthzContext, RoleAssignment } from "./types";

/** Resolve UI “primary” role: explicit primary flag wins, else earliest assignment. */
export function pickPrimaryRoleId(assignments: readonly RoleAssignment[]): string | null {
  const primary = assignments.find((a) => a.is_primary);
  if (primary) return primary.role_id;
  return assignments[0]?.role_id ?? null;
}

export function hasPermission(ctx: AuthzContext | null | undefined, permission: PermissionId | string): boolean {
  if (!ctx) return false;
  return ctx.permissions.has(permission);
}

/**
 * Match a permission stored as `resource` + `action` in the DB (`id` is `${resource}:${action}`).
 * Works for dotted resources, e.g. resource `admin.hotels`, action `read` → `admin.hotels:read`.
 */
export function hasResourceAction(ctx: AuthzContext | null | undefined, resource: string, action: string): boolean {
  if (!ctx) return false;
  return ctx.permissions.has(`${resource}:${action}`);
}

export function hasRole(ctx: AuthzContext | null | undefined, roleId: string): boolean {
  if (!ctx) return false;
  return ctx.roleIds.includes(roleId);
}

export function hasAnyRole(ctx: AuthzContext | null | undefined, roleIds: readonly string[]): boolean {
  if (!ctx) return false;
  return roleIds.some((id) => ctx.roleIds.includes(id));
}

/** True if the user holds every listed permission. */
export function hasAllPermissions(
  ctx: AuthzContext | null | undefined,
  permissions: readonly (PermissionId | string)[],
): boolean {
  if (!ctx) return false;
  return permissions.every((p) => ctx.permissions.has(p));
}

/** True if the user holds at least one of the listed permissions. */
export function hasAnyPermission(
  ctx: AuthzContext | null | undefined,
  permissions: readonly (PermissionId | string)[],
): boolean {
  if (!ctx) return false;
  return permissions.some((p) => ctx.permissions.has(p));
}
