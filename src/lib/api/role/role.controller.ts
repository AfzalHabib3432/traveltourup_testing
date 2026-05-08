import "server-only";

import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/error-handler";
import { successResponse } from "@/lib/api/response";
import { getServerAuthz } from "@/lib/authz/session";
import { assertPermission } from "@/lib/authz/server";
import type { PermissionId } from "@/lib/authz/registry";
import {
  listRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  setRolePermissions,
  listPermissions,
} from "@/lib/services/role/role.service";
import {
  roleCreateSchema,
  roleUpdateSchema,
  rolePermissionAssignmentSchema,
} from "@/lib/validations/role.schema";

const ROLES_READ: PermissionId = "admin.roles:read";
const ROLES_WRITE: PermissionId = "admin.roles:write";
const ROLES_DELETE: PermissionId = "admin.roles:delete";
const PERMS_READ: PermissionId = "admin.permissions:read";

// --------------- Role collection ---------------

export async function handleRoleCollectionGET(): Promise<Response> {
  try {
    const { authz } = await getServerAuthz();
    assertPermission(authz, ROLES_READ);
    const roles = await listRoles();
    return successResponse(roles);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function handleRoleCollectionPOST(req: NextRequest): Promise<Response> {
  try {
    const { authz } = await getServerAuthz();
    assertPermission(authz, ROLES_WRITE);
    const body = await req.json();
    const data = roleCreateSchema.parse(body);
    const role = await createRole(data);
    return successResponse(role, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

// --------------- Role item ---------------

export async function handleRoleItemGET(
  _req: NextRequest,
  params: Promise<{ id: string }>,
): Promise<Response> {
  try {
    const { authz } = await getServerAuthz();
    assertPermission(authz, ROLES_READ);
    const { id } = await params;
    const role = await getRole(id);
    return successResponse(role);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function handleRoleItemPATCH(
  req: NextRequest,
  params: Promise<{ id: string }>,
): Promise<Response> {
  try {
    const { authz } = await getServerAuthz();
    assertPermission(authz, ROLES_WRITE);
    const { id } = await params;
    const body = await req.json();
    const data = roleUpdateSchema.parse(body);
    const role = await updateRole(id, data);
    return successResponse(role);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function handleRoleItemDELETE(
  _req: NextRequest,
  params: Promise<{ id: string }>,
): Promise<Response> {
  try {
    const { authz } = await getServerAuthz();
    assertPermission(authz, ROLES_DELETE);
    const { id } = await params;
    await deleteRole(id);
    return successResponse({ ok: true as const });
  } catch (error) {
    return handleApiError(error);
  }
}

// --------------- Role permissions ---------------

export async function handleRolePermissionsPUT(
  req: NextRequest,
  params: Promise<{ id: string }>,
): Promise<Response> {
  try {
    const { authz } = await getServerAuthz();
    assertPermission(authz, "admin.rbac:manage");
    const { id } = await params;
    const body = await req.json();
    const data = rolePermissionAssignmentSchema.parse(body);
    const role = await setRolePermissions(id, data.permission_ids);
    return successResponse(role);
  } catch (error) {
    return handleApiError(error);
  }
}

// --------------- Permission catalog ---------------

export async function handlePermissionsGET(): Promise<Response> {
  try {
    const { authz } = await getServerAuthz();
    assertPermission(authz, PERMS_READ);
    const groups = await listPermissions();
    return successResponse(groups);
  } catch (error) {
    return handleApiError(error);
  }
}
