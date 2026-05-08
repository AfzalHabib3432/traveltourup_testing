"use client";

import { apiJson, apiPaginatedJson, type PaginatedApiResponse } from "@/lib/http/api-client";
import type { UserProfileDto, UserListItemDto, RoleDto } from "@/lib/user/user.types";

export const USERS_V1_BASE = "/api/v1/users";
export const ROLES_V1_BASE = "/api/v1/roles";

// --------------- Self-service (requires any authenticated user) ---------------

export async function getMyProfile(): Promise<UserProfileDto> {
  return apiJson<UserProfileDto>(`${USERS_V1_BASE}/me`);
}

export async function updateMyProfile(body: unknown): Promise<UserProfileDto> {
  return apiJson<UserProfileDto>(`${USERS_V1_BASE}/me`, { method: "PATCH", body });
}

// --------------- Admin: list + CRUD (requires admin.users:* permission) ---------------

export async function listUsers(
  params: Record<string, string | number | undefined>,
): Promise<PaginatedApiResponse<UserListItemDto>> {
  return apiPaginatedJson<UserListItemDto>(USERS_V1_BASE, params);
}

export async function getUser(id: string): Promise<UserListItemDto> {
  return apiJson<UserListItemDto>(`${USERS_V1_BASE}/${encodeURIComponent(id)}`);
}

export async function createUser(body: unknown): Promise<UserListItemDto> {
  return apiJson<UserListItemDto>(USERS_V1_BASE, { method: "POST", body });
}

export async function updateUser(id: string, body: unknown): Promise<UserListItemDto> {
  return apiJson<UserListItemDto>(`${USERS_V1_BASE}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body,
  });
}

export async function deleteUser(id: string): Promise<void> {
  await apiJson<{ ok: true }>(`${USERS_V1_BASE}/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// --------------- Admin: role management (requires admin.rbac:manage) ---------------

export async function setUserRoles(
  id: string,
  body: { role_ids: string[]; primary_role_id: string },
): Promise<UserListItemDto> {
  return apiJson<UserListItemDto>(
    `${USERS_V1_BASE}/${encodeURIComponent(id)}/roles`,
    { method: "PUT", body },
  );
}

export async function listRoles(): Promise<RoleDto[]> {
  return apiJson<RoleDto[]>(ROLES_V1_BASE);
}
