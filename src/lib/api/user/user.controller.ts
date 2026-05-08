import "server-only";

import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/error-handler";
import { paginatedResponse, successResponse } from "@/lib/api/response";
import { getServerAuthz } from "@/lib/authz/session";
import { assertPermission, assertUserId } from "@/lib/authz/server";
import type { PermissionId } from "@/lib/authz/registry";
import {
  listUsersForAdmin,
  getUserForAdmin,
  createUserFromAdmin,
  updateUserFromAdmin,
  deleteUserFromAdmin,
  setUserRoles,
  listAllRoles,
  getProfileByUserId,
  updateMyProfile,
} from "@/lib/services/user/user.service";
import {
  userAdminListQuerySchema,
  userAdminCreateSchema,
  userAdminUpdateSchema,
  userRoleAssignmentSchema,
  updateMeProfileSchema,
} from "@/lib/validations/user.schema";

const USERS_READ: PermissionId = "admin.users:read";
const USERS_WRITE: PermissionId = "admin.users:write";

// --------------- Admin collection ---------------

export async function handleUserCollectionGET(req: NextRequest): Promise<Response> {
  try {
    const { authz } = await getServerAuthz();
    assertPermission(authz, USERS_READ);

    const { searchParams } = new URL(req.url);
    const query = userAdminListQuerySchema.parse({
      q: searchParams.get("q") ?? undefined,
      role_id: searchParams.get("role_id") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
      order: searchParams.get("order") ?? undefined,
    });

    const { items, total } = await listUsersForAdmin(query);
    return paginatedResponse(items, { total, page: query.page, limit: query.limit });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function handleUserCollectionPOST(req: NextRequest): Promise<Response> {
  try {
    const { authz } = await getServerAuthz();
    assertPermission(authz, USERS_WRITE);
    const body = await req.json();
    const data = userAdminCreateSchema.parse(body);
    const user = await createUserFromAdmin(data, authz);
    return successResponse(user, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

// --------------- Admin item ---------------

export async function handleUserItemGET(
  _req: NextRequest,
  params: Promise<{ id: string }>,
): Promise<Response> {
  try {
    const { authz } = await getServerAuthz();
    assertPermission(authz, USERS_READ);
    const { id } = await params;
    const user = await getUserForAdmin(id);
    return successResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function handleUserItemPATCH(
  req: NextRequest,
  params: Promise<{ id: string }>,
): Promise<Response> {
  try {
    const { authz } = await getServerAuthz();
    assertPermission(authz, USERS_WRITE);
    const { id } = await params;
    const body = await req.json();
    const data = userAdminUpdateSchema.parse(body);
    const user = await updateUserFromAdmin(id, data);
    return successResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function handleUserItemDELETE(
  _req: NextRequest,
  params: Promise<{ id: string }>,
): Promise<Response> {
  try {
    const { authz } = await getServerAuthz();
    assertPermission(authz, USERS_WRITE);
    const { id } = await params;
    await deleteUserFromAdmin(id, authz);
    return successResponse({ ok: true as const });
  } catch (error) {
    return handleApiError(error);
  }
}

// --------------- Role assignment ---------------

export async function handleUserRolesPUT(
  req: NextRequest,
  params: Promise<{ id: string }>,
): Promise<Response> {
  try {
    const { authz } = await getServerAuthz();
    assertPermission(authz, "admin.rbac:manage");
    const { id } = await params;
    const body = await req.json();
    const data = userRoleAssignmentSchema.parse(body);
    const user = await setUserRoles(id, data.role_ids, data.primary_role_id, authz);
    return successResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
}

// --------------- Self-service ---------------

export async function handleMyProfileGET(): Promise<Response> {
  try {
    const { userId } = await getServerAuthz();
    assertUserId(userId);
    const profile = await getProfileByUserId(userId);
    return successResponse(profile);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function handleMyProfilePATCH(req: NextRequest): Promise<Response> {
  try {
    const { userId } = await getServerAuthz();
    assertUserId(userId);
    const body = await req.json();
    const data = updateMeProfileSchema.parse(body);
    const profile = await updateMyProfile(userId, data);
    return successResponse(profile);
  } catch (error) {
    return handleApiError(error);
  }
}

// --------------- Roles listing ---------------

export async function handleRolesGET(): Promise<Response> {
  try {
    const { authz } = await getServerAuthz();
    assertPermission(authz, USERS_READ);
    const roles = await listAllRoles();
    return successResponse(roles);
  } catch (error) {
    return handleApiError(error);
  }
}
