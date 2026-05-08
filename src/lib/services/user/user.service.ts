import "server-only";

import { NotFoundError, AppError } from "@/lib/api/errors";
import { userRepository } from "@/lib/db/repositories/user.repository";
import { updateMeProfileSchema } from "@/lib/validations/user.schema";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";
import { ROLE_BOOTSTRAP } from "@/lib/authz/registry";
import type { AuthzContext } from "@/lib/authz/types";
import type {
  UserProfileDto,
  UserListItemDto,
  UserRoleDto,
  RoleDto,
} from "@/lib/user/user.types";
import type { z } from "zod";

// --------------- Self-service (existing) ---------------

export type UpdateMeProfileInput = z.infer<typeof updateMeProfileSchema>;

export async function getProfileByUserId(userId: string) {
  const profile = await userRepository.findByAuthId(userId);
  if (!profile) {
    throw new NotFoundError("Profile");
  }
  return profile;
}

export async function updateMyProfile(userId: string, data: UpdateMeProfileInput) {
  const profile = await userRepository.findByAuthId(userId);
  if (!profile) {
    throw new NotFoundError("Profile");
  }

  const next: Record<string, unknown> = {};
  if (data.first_name !== undefined) next.first_name = data.first_name;
  if (data.last_name !== undefined) next.last_name = data.last_name;
  if (data.phone !== undefined) next.phone = data.phone;
  if (data.phone_country_code !== undefined) next.phone_country_code = data.phone_country_code;
  if (data.country_code !== undefined) next.country_code = data.country_code;
  if (data.currency_id !== undefined) next.currency_id = data.currency_id;
  if (data.avatar_path !== undefined) next.avatar_path = data.avatar_path;

  return userRepository.updateProfile(userId, next);
}

export async function setMyAvatarPath(userId: string, avatarPath: string | null) {
  const profile = await userRepository.findByAuthId(userId);
  if (!profile) {
    throw new NotFoundError("Profile");
  }
  return userRepository.updateProfile(userId, { avatar_path: avatarPath });
}

// --------------- Admin CRUD ---------------

type ProfileRow = NonNullable<Awaited<ReturnType<typeof userRepository.findByIdWithRoles>>>;

function mapRoles(row: ProfileRow): UserRoleDto[] {
  return row.user_roles.map((ur) => ({
    id: ur.role.id,
    name: ur.role.name,
    isPrimary: ur.is_primary,
  }));
}

function mapRowToDto(row: ProfileRow, email?: string): UserListItemDto {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    phoneCountryCode: row.phone_country_code,
    countryCode: row.country_code,
    avatarPath: row.avatar_path,
    roles: mapRoles(row),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    email: email ?? "",
  };
}

function mapRowToProfile(row: ProfileRow): UserProfileDto {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    phoneCountryCode: row.phone_country_code,
    countryCode: row.country_code,
    avatarPath: row.avatar_path,
    roles: mapRoles(row),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function listUsersForAdmin(query: {
  q?: string;
  role_id?: string;
  page: number;
  limit: number;
  sort: string;
  order: "asc" | "desc";
}): Promise<{ items: UserListItemDto[]; total: number }> {
  const { items, total } = await userRepository.findManyWithRoles(query);

  const supaAdmin = createSupabaseServiceRoleClient();
  const dtos = await Promise.all(
    items.map(async (row) => {
      let email = "";
      try {
        const { data } = await supaAdmin.auth.admin.getUserById(row.id);
        email = data.user?.email ?? "";
      } catch {
        // auth lookup failed — leave email blank
      }
      return mapRowToDto(row, email);
    }),
  );

  return { items: dtos, total };
}

export async function getUserForAdmin(userId: string): Promise<UserListItemDto> {
  const row = await userRepository.findByIdWithRoles(userId);
  if (!row) throw new NotFoundError("User");

  let email = "";
  try {
    const supaAdmin = createSupabaseServiceRoleClient();
    const { data } = await supaAdmin.auth.admin.getUserById(userId);
    email = data.user?.email ?? "";
  } catch {
    // no-op
  }

  return mapRowToDto(row, email);
}

function getRoleSortOrder(roleId: string): number {
  const found = ROLE_BOOTSTRAP.find((r) => r.id === roleId);
  return found?.sortOrder ?? 999;
}

function assertCallerCanAssignRole(callerAuthz: AuthzContext, roleId: string) {
  const callerBestOrder = Math.min(
    ...callerAuthz.roleIds.map((rid) => getRoleSortOrder(rid)),
  );
  const targetOrder = getRoleSortOrder(roleId);

  if (targetOrder < callerBestOrder) {
    throw new AppError(403, "Cannot assign a role above your own level", "HIERARCHY_VIOLATION");
  }
}

export async function createUserFromAdmin(
  data: { email: string; first_name: string; last_name: string; password?: string; role_id: string },
  callerAuthz: AuthzContext,
): Promise<UserListItemDto> {
  assertCallerCanAssignRole(callerAuthz, data.role_id);

  const supaAdmin = createSupabaseServiceRoleClient();

  const createPayload: Record<string, unknown> = {
    email: data.email,
    email_confirm: true,
    user_metadata: {
      first_name: data.first_name,
      last_name: data.last_name,
    },
  };
  if (data.password) createPayload.password = data.password;

  const { data: created, error } = await supaAdmin.auth.admin.createUser(createPayload);
  if (error) throw new AppError(400, error.message, "SUPABASE_ERROR");

  const authId = created.user.id;

  const { prisma } = await import("@/lib/prisma");
  await prisma.user.upsert({
    where: { id: authId },
    create: {
      id: authId,
      first_name: data.first_name,
      last_name: data.last_name,
    },
    update: {
      first_name: data.first_name,
      last_name: data.last_name,
    },
  });

  const { assignRoleToUser } = await import("@/lib/authz/mutations");
  await assignRoleToUser(authId, data.role_id, { isPrimary: true });

  return getUserForAdmin(authId);
}

export async function updateUserFromAdmin(
  userId: string,
  data: { first_name?: string; last_name?: string; phone?: string | null; phone_country_code?: string | null },
): Promise<UserListItemDto> {
  const existing = await userRepository.findByIdWithRoles(userId);
  if (!existing) throw new NotFoundError("User");

  const next: Record<string, unknown> = {};
  if (data.first_name !== undefined) next.first_name = data.first_name;
  if (data.last_name !== undefined) next.last_name = data.last_name;
  if (data.phone !== undefined) next.phone = data.phone;
  if (data.phone_country_code !== undefined) next.phone_country_code = data.phone_country_code;

  await userRepository.updateProfile(userId, next);
  return getUserForAdmin(userId);
}

export async function deleteUserFromAdmin(
  userId: string,
  callerAuthz: AuthzContext,
): Promise<void> {
  if (userId === callerAuthz.userId) {
    throw new AppError(400, "Cannot delete your own account", "SELF_DELETE");
  }

  const existing = await userRepository.findByIdWithRoles(userId);
  if (!existing) throw new NotFoundError("User");

  for (const ur of existing.user_roles) {
    assertCallerCanAssignRole(callerAuthz, ur.role.id);
  }

  await userRepository.deleteProfile(userId);

  try {
    const supaAdmin = createSupabaseServiceRoleClient();
    await supaAdmin.auth.admin.deleteUser(userId);
  } catch {
    // profile already deleted; auth cleanup best-effort
  }
}

// --------------- Role management ---------------

export async function setUserRoles(
  userId: string,
  roleIds: string[],
  primaryRoleId: string,
  callerAuthz: AuthzContext,
): Promise<UserListItemDto> {
  if (userId === callerAuthz.userId) {
    const removingSuperAdmin =
      callerAuthz.roleIds.includes("super_admin") && !roleIds.includes("super_admin");
    if (removingSuperAdmin) {
      throw new AppError(400, "Cannot remove your own super_admin role", "LOCKOUT_PREVENTION");
    }
  }

  for (const rid of roleIds) {
    assertCallerCanAssignRole(callerAuthz, rid);
  }

  if (!roleIds.includes(primaryRoleId)) {
    throw new AppError(400, "primary_role_id must be in role_ids", "VALIDATION_ERROR");
  }

  const existing = await userRepository.findByIdWithRoles(userId);
  if (!existing) throw new NotFoundError("User");

  await userRepository.setUserRoles(userId, roleIds, primaryRoleId);
  return getUserForAdmin(userId);
}

export async function listAllRoles(): Promise<RoleDto[]> {
  const rows = await userRepository.findAllRoles();
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    isSystem: r.is_system,
  }));
}
