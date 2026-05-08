import "server-only";

import { AppError, NotFoundError } from "@/lib/api/errors";
import { PROTECTED_ROLE_IDS } from "@/lib/authz/registry";
import { roleRepository } from "@/lib/db/repositories/role.repository";
import type {
  RoleDetailDto,
  RoleListItemDto,
  PermissionDto,
  PermissionGroupDto,
} from "@/lib/role/role.types";

function assertNotProtectedRole(roleId: string) {
  if ((PROTECTED_ROLE_IDS as readonly string[]).includes(roleId)) {
    throw new AppError(403, "System roles cannot be modified", "PROTECTED_ROLE");
  }
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

type RoleRow = NonNullable<Awaited<ReturnType<typeof roleRepository.findById>>>;

function mapPermission(p: RoleRow["role_permissions"][number]["permission"]): PermissionDto {
  return {
    id: p.id,
    resource: p.resource,
    action: p.action,
    description: p.description,
    category: p.category,
  };
}

function mapRoleDetail(row: RoleRow): RoleDetailDto {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    isSystem: row.is_system,
    sortOrder: row.sort_order,
    permissionCount: row.role_permissions.length,
    permissions: row.role_permissions.map((rp) => mapPermission(rp.permission)),
    userCount: row._count.user_roles,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function listRoles(): Promise<RoleListItemDto[]> {
  const rows = await roleRepository.findAll();
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    isSystem: r.is_system,
    sortOrder: r.sort_order,
    permissionCount: r._count.role_permissions,
    userCount: r._count.user_roles,
    createdAt: r.created_at.toISOString(),
    updatedAt: r.updated_at.toISOString(),
  }));
}

export async function getRole(id: string): Promise<RoleDetailDto> {
  const row = await roleRepository.findById(id);
  if (!row) throw new NotFoundError("Role");
  return mapRoleDetail(row);
}

export async function createRole(data: {
  name: string;
  description?: string;
}): Promise<RoleDetailDto> {
  const slug = slugify(data.name);
  if (!slug) {
    throw new AppError(400, "Role name must contain at least one alphanumeric character", "VALIDATION_ERROR");
  }

  const existing = await roleRepository.roleIdExists(slug);
  if (existing) {
    throw new AppError(409, `A role with id "${slug}" already exists`, "DUPLICATE_ROLE");
  }

  const row = await roleRepository.create({
    id: slug,
    name: data.name.trim(),
    description: data.description,
  });

  return mapRoleDetail(row);
}

export async function updateRole(
  id: string,
  data: { name?: string; description?: string | null },
): Promise<RoleDetailDto> {
  assertNotProtectedRole(id);

  const existing = await roleRepository.findById(id);
  if (!existing) throw new NotFoundError("Role");

  if (existing.is_system) {
    throw new AppError(403, "System roles cannot be modified", "PROTECTED_ROLE");
  }

  const row = await roleRepository.update(id, data);
  return mapRoleDetail(row);
}

export async function deleteRole(id: string): Promise<void> {
  assertNotProtectedRole(id);

  const existing = await roleRepository.findById(id);
  if (!existing) throw new NotFoundError("Role");

  if (existing.is_system) {
    throw new AppError(403, "System roles cannot be deleted", "PROTECTED_ROLE");
  }

  if (existing._count.user_roles > 0) {
    throw new AppError(
      409,
      `Cannot delete role "${existing.name}" because it is assigned to ${existing._count.user_roles} user(s)`,
      "ROLE_IN_USE",
    );
  }

  await roleRepository.deleteRole(id);
}

export async function setRolePermissions(
  roleId: string,
  permissionIds: string[],
): Promise<RoleDetailDto> {
  assertNotProtectedRole(roleId);

  const existing = await roleRepository.findById(roleId);
  if (!existing) throw new NotFoundError("Role");

  if (existing.is_system) {
    throw new AppError(403, "System role permissions cannot be modified", "PROTECTED_ROLE");
  }

  await roleRepository.setPermissions(roleId, permissionIds);

  const updated = await roleRepository.findById(roleId);
  if (!updated) throw new NotFoundError("Role");
  return mapRoleDetail(updated);
}

export async function listPermissions(): Promise<PermissionGroupDto[]> {
  const rows = await roleRepository.findAllPermissions();

  const groups = new Map<string, PermissionDto[]>();
  for (const p of rows) {
    const cat = p.category ?? "other";
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push({
      id: p.id,
      resource: p.resource,
      action: p.action,
      description: p.description,
      category: p.category,
    });
  }

  return Array.from(groups.entries()).map(([category, permissions]) => ({
    category,
    permissions,
  }));
}
