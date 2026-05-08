"use client";

import { apiJson } from "@/lib/http/api-client";
import type {
  RoleDetailDto,
  RoleListItemDto,
  PermissionGroupDto,
} from "@/lib/role/role.types";

const ROLES_BASE = "/api/v1/roles";
const PERMISSIONS_BASE = "/api/v1/permissions";

export async function listRoles(): Promise<RoleListItemDto[]> {
  return apiJson<RoleListItemDto[]>(ROLES_BASE);
}

export async function getRole(id: string): Promise<RoleDetailDto> {
  return apiJson<RoleDetailDto>(`${ROLES_BASE}/${encodeURIComponent(id)}`);
}

export async function createRole(body: {
  name: string;
  description?: string;
}): Promise<RoleDetailDto> {
  return apiJson<RoleDetailDto>(ROLES_BASE, { method: "POST", body });
}

export async function updateRole(
  id: string,
  body: { name?: string; description?: string | null },
): Promise<RoleDetailDto> {
  return apiJson<RoleDetailDto>(`${ROLES_BASE}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body,
  });
}

export async function deleteRole(id: string): Promise<void> {
  await apiJson<{ ok: true }>(`${ROLES_BASE}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function setRolePermissions(
  roleId: string,
  permissionIds: string[],
): Promise<RoleDetailDto> {
  return apiJson<RoleDetailDto>(
    `${ROLES_BASE}/${encodeURIComponent(roleId)}/permissions`,
    { method: "PUT", body: { permission_ids: permissionIds } },
  );
}

export async function listPermissions(): Promise<PermissionGroupDto[]> {
  return apiJson<PermissionGroupDto[]>(PERMISSIONS_BASE);
}
